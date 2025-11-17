import micropython
import uasyncio as asyncio
import network, urequests, ujson
from time import ticks_ms, ticks_diff
from machine import ADC, Pin, Timer
import machine
import ustruct
from array import array
import gc

# — emergency IRQ exception buffer —
micropython.alloc_emergency_exception_buf(100)

# — CONFIG —──────────────────────────────────────────────────────
SSID = "H_qitai"
PASSWORD = "88888888"
FILENAME = "recorded_data.bin"

# build a pseudo‐unique serial string
ord_serial_number = [ord(char) for char in str(machine.unique_id())]
SERIAL_NUMBER = "-".join(str(num) for num in ord_serial_number)

# buffer ~10 s @100 Hz
BUF_SIZE = 1024
v_buf = array('H', [0] * BUF_SIZE)
c_buf = array('H', [0] * BUF_SIZE)
t_buf = array('I', [0] * BUF_SIZE)
write_ptr = 0
read_ptr  = 0

# state for averaging quads
quad_count = 0
sum_v = 0
sum_c = 0
sum_t = 0

wlan = None
stop_sampling = False

# server base – assigned once we get on Wi-Fi
server_ip = ""

# timestamp origin
SCRIPT_START = ticks_ms()

# pre-instantiate ADCs so IRQ is tiny
adc_v = ADC(Pin(27))
adc_c = ADC(Pin(26))

# — HELPERS —──────────────────────────────────────────────────────
def wifi_connected():
    return wlan is not None and wlan.isconnected()

async def try_connect_wifi():
    global wlan, server_ip
    if wlan:
        wlan.active(False)
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    for _ in range(6):             # wait up to 3 s
        await asyncio.sleep(0.5)
        if wlan.isconnected():
            ip, mask, *_ = wlan.ifconfig()
            # derive server_ip by replacing masked‐out octets with “77”
            ip_parts   = list(map(int, ip.split('.')))
            mask_parts = list(map(int, mask.split('.')))
            out = []
            for octet_i, m in zip(ip_parts, mask_parts):
                out.append(str(octet_i) if m != 0 else '77')
            server_ip = '.'.join(out)
            print("✅ Wi-Fi up:", wlan.ifconfig(), "→ server:", server_ip)
            return True
    print("⚠️ Wi-Fi failed")
    return False

def clear_local_storage():
    with open(FILENAME, "wb"):
        pass


def flush_ringbuffer_to_file():
    """
    Dump any unwritten averaged samples to flash in binary form:
      6 bytes each = uint16(t_hundredths), uint16(v_raw), uint16(c_raw)
    """
    global read_ptr
    with open(FILENAME, "ab") as f:
        while read_ptr != write_ptr:
            v_raw = v_buf[read_ptr]
            c_raw = c_buf[read_ptr]
            # convert stored ms to centiseconds (100ths of a second)
            t_cs = (t_buf[read_ptr] + 5) // 10  # rounding
            # pack as three uint16 little-endian
            f.write(ustruct.pack("<HHH", t_cs, v_raw, c_raw))
            read_ptr = (read_ptr + 1) % BUF_SIZE
    gc.collect()


def read_binary_as_json_list():
    lst = []
    try:
        with open(FILENAME, "rb") as f:
            raw = f.read()
        rec_size = 6               # 2 B t_cs + 2 B v_raw + 2 B c_raw
        n = len(raw) // rec_size
        for i in range(n):
            # unpack one record
            t_cs, v_raw, c_raw = ustruct.unpack_from("<HHH", raw, i * rec_size)
            # convert back
            t_s = t_cs / 100.0                     # seconds
            v   = v_raw * 3.3 / 65535 * 3.7        # volts
            c   = c_raw * 3.3 / 65535              # amps
            lst.append({
                "v": f"{v:.2f}",
                "c": f"{c:.2f}",
                "t": f"{t_s:.2f}"
            })
    except Exception as e:
        print("❌ failed to unpack binary:", e)
    return lst

# — IRQ SAMPLER + SCHEDULE —──────────────────────────────────────
def _sample_cb(_):
    micropython.schedule(_handle_sample, 0)

def _handle_sample(_):
    global write_ptr, quad_count, sum_v, sum_c, sum_t
    v_raw = adc_v.read_u16()
    c_raw = adc_c.read_u16()
    t = ticks_diff(ticks_ms(), SCRIPT_START)
    
    sum_v += v_raw
    sum_c += c_raw
    sum_t += t
    quad_count += 1
    
    if quad_count == 4:
    # first sample of the pair
        avg_v = sum_v // 4
        avg_c = sum_c // 4
        avg_t = sum_t // 4

        v_buf[write_ptr] = avg_v
        c_buf[write_ptr] = avg_c
        t_buf[write_ptr] = avg_t
        write_ptr = (write_ptr + 1) % BUF_SIZE

        # reset for next quad
        quad_count = 0
        sum_v = 0
        sum_c = 0
        sum_t = 0

timer = Timer()
timer.init(freq=100, mode=Timer.PERIODIC, callback=_sample_cb)

# — ASYNC TASKS —────────────────────────────────────────────────
async def send_task():
    while not stop_sampling:
        flush_ringbuffer_to_file()

        if not wifi_connected():
            await try_connect_wifi()
        else:
            # **unpack the bin file into a JSONable list of dicts**
            payload = read_binary_as_json_list()

            try:
                # register/work as before...
                current_ticks = ticks_diff(ticks_ms(), SCRIPT_START)
                ep_reg  = f"http://{server_ip}:8080/api/ecus/register/{SERIAL_NUMBER}/{current_ticks}"
                urequests.post(ep_reg).close()

                # now send the unpacked JSON
                ep_bulk = f"http://{server_ip}:8080/api/ecus/bulk/{SERIAL_NUMBER}"
                urequests.post(ep_bulk, json=payload).close()

                clear_local_storage()
            except Exception as e:
                print("❌ send failed:", e)

        await asyncio.sleep(0.5)



# — MAIN —───────────────────────────────────────────────────────
async def main():
    await try_connect_wifi()
    await asyncio.gather(
        send_task(),
        return_exceptions=True
    )

asyncio.run(main())



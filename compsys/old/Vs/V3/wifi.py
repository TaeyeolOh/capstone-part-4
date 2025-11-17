import micropython
import uasyncio as asyncio
import network, urequests, ujson
from time import ticks_ms, ticks_diff
from machine import ADC, Pin, Timer
import machine
from array import array
import gc

# — emergency IRQ exception buffer —
micropython.alloc_emergency_exception_buf(100)

# — CONFIG —──────────────────────────────────────────────────────
SSID = "H_qitai"
PASSWORD = "88888888"
FILENAME = "recorded_data.json"
# method to get unique ID I got from the internet
# replace it if it doesn't work
SERIAL_NUMBER = machine.unique_id()

# buffer ~10 s @100 Hz
BUF_SIZE = 1024
v_buf = array('H', [0] * BUF_SIZE)
c_buf = array('H', [0] * BUF_SIZE)
t_buf = array('I', [0] * BUF_SIZE)
write_ptr = 0
read_ptr  = 0

wlan = None
stop_sampling = False

# server URL
# do not use unless wifi_connected() is true
server_ip = ""

# pre-instantiate ADCs
adc_v = ADC(Pin(26))
adc_c = ADC(Pin(27))


# — HELPERS —──────────────────────────────────────────────────────
def wifi_connected():
    return wlan is not None and wlan.isconnected()

async def try_connect_wifi():
    global wlan
    global server_ip
    # one-shot attempt (caller can retry)
    if wlan:
        wlan.active(False)
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    # give it up to 3 s
    for _ in range(6):
        await asyncio.sleep(0.5)
        if wlan.isconnected():

            # added code to get the server IP

            # get the IP address and mask
            wlanif = wlan.ifconfig()
            ip = wlanif[0]
            mask = wlanif[1]

            # convert to server IP
            ip_parts = list(map(int, ip.split('.')))
            mask_parts = list(map(int, mask.split('.')))
            masked_ip = []
            for i in range(4):
                # For each octet, replace with 77 where mask is 0 else keep the original
                if mask_parts[i] == 0:
                    masked_ip.append('77' * len(str(ip_parts[i])))
                else:
                    masked_ip.append(str(ip_parts[i]))
            server_ip = '.'.join(masked_ip)

            print(f"✅ Wi-Fi connected")
            return True
    print("⚠️ Wi-Fi failed")
    return False

def clear_local_storage():
    with open(FILENAME, "w"):
        pass

def flush_ringbuffer_to_file():
    """Immediately dump any unwritten samples from RAM buffer to disk."""
    global read_ptr
    with open(FILENAME, "a") as f:
        while read_ptr != write_ptr:
            v_raw = v_buf[read_ptr]
            c_raw = c_buf[read_ptr]
            t     = t_buf[read_ptr]
            v = v_raw * 3.3 / 65535
            c = c_raw * 3.3 / 65535
            entry = {"v":f"{v:.2f}", "c":f"{c:.2f}", "t":t}
            f.write(ujson.dumps(entry) + "\n")
            read_ptr = (read_ptr + 1) % BUF_SIZE
    gc.collect()

def read_file_as_json_list(filename):
    """Read the file and return a list of JSON objects"""
    json_list = []
    try:
        with open(filename, "r") as f:
            for line in f:
                line = line.strip()  # Remove any whitespace/newlines
                if line:  # Only process non-empty lines
                    try:
                        json_obj = ujson.loads(line)
                        json_list.append(json_obj)
                    except ValueError as e:
                        print(f"❌ Error parsing JSON line: {line} - {e}")
        return json_list
    except OSError as e:
        print(f"❌ Error reading file: {e}")
        return None

# — IRQ SAMPLER + SCHEDULE —──────────────────────────────────────
def _sample_cb(_):
    micropython.schedule(_handle_sample, 0)

def _handle_sample(_):
    global write_ptr
    v_raw = adc_v.read_u16()
    c_raw = adc_c.read_u16()
    t = ticks_diff(ticks_ms(), SCRIPT_START)

    v_buf[write_ptr] = v_raw
    c_buf[write_ptr] = c_raw
    t_buf[write_ptr] = t
    write_ptr = (write_ptr + 1) % BUF_SIZE

timer = Timer()
timer.init(freq=100, mode=Timer.PERIODIC, callback=_sample_cb)


# — ASYNC TASKS —────────────────────────────────────────────────
# modified to both flush the ringbuffer and send the data from reading the file
async def send_task():
    global wlan
    while not stop_sampling:
        # flush the ringbuffer to file
        flush_ringbuffer_to_file()
        if not wifi_connected():
            await try_connect_wifi()
        else:
            try:
                # read the file
                payload = read_file_as_json_list(FILENAME)

                # register the ecu with the server
                current_ticks = ticks_diff(ticks_ms(), SCRIPT_START)
                register_endpoint = f"http://{server_ip}:8080/api/ecus/register/{SERIAL_NUMBER}/{current_ticks}"
                register_req = urequests.post(register_endpoint)
                register_req.close()

                send_endpoint = f"http://{server_ip}:8080/api/ecus/bulk/{SERIAL_NUMBER}"
                send_req = urequests.post(send_endpoint, json=payload)
                send_req.close()

                clear_local_storage()
            except Exception as e:
                print("❌ send failed:", e)
        # every 20s
        await asyncio.sleep(20)

# not sure what to do with this since we're replacing server.py with the backend

# async def listen_stop_signal_task():
#     global stop_sampling
#     while True:
#         await asyncio.sleep(2)
#         if not wifi_connected():
#             await try_connect_wifi()
#
#         try:
#             r = urequests.get(SERVER_CHECK_STOP_URL)
#             stop = r.json().get("stop_sampling", False)
#             r.close()
#         except Exception as e:
#             print("❌ check_stop failed:", e)
#             continue
#
#         if stop:
#             print("🛑 Stop signal!")
#             # 1) stop sampling
#             timer.deinit()
#             stop_sampling = True
#             break
#
#     # — FINAL BULK UPLOAD from the local file —
#     if not wifi_connected():
#         await try_connect_wifi()
#
#     uploaded_total = 0
#     batch_no = 1
#     try:
#         with open(FILENAME, "r") as f:
#             while True:
#                 batch = []
#                 for _ in range(100):
#                     line = f.readline()
#                     if not line:
#                         break
#                     batch.append(ujson.loads(line))
#                 if not batch:
#                     break
#
#                 # Calculate indexes and timestamp span
#                 start_idx = uploaded_total + 1
#                 end_idx = uploaded_total + len(batch)
#                 ts_start  = batch[0]["t"]
#                 ts_end    = batch[-1]["t"]
#
#                 r = urequests.post(SERVER_UPLOAD_ALL_URL, json=batch)
#                 r.close()
#
#                 print(f"✅ Batch {batch_no} complete "
#                       f"({len(batch)} samples)")
#
#                 uploaded_total += len(batch)
#                 batch_no      += 1
#                 gc.collect()
#
#             await asyncio.sleep_ms(50)
#             flush_ringbuffer_to_file()
#
#         print(f"🎉 All done: uploaded {uploaded_total} samples in {batch_no-1} batches.")
#     except Exception as e:
#         print("❌ final file upload failed:", e)


# — MAIN —───────────────────────────────────────────────────────


async def main():
    clear_local_storage()
    await try_connect_wifi()
    await asyncio.gather(
        send_task(),
        return_exceptions=True
    )
    
SCRIPT_START = ticks_ms()
asyncio.run(main())
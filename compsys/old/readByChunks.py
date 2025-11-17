import ustruct
from array import array
from machine import ADC, Pin
from time import ticks_ms, ticks_diff
import gc

FILENAME = "recorded_data.bin"
BUF_SIZE = 64  # smaller buffer for test
v_buf = array('H', [0] * BUF_SIZE)
c_buf = array('H', [0] * BUF_SIZE)
t_buf = array('I', [0] * BUF_SIZE)
write_ptr = 0
read_ptr = 0

# Simulated ADC readings
adc_v = ADC(Pin(27))
adc_c = ADC(Pin(26))
SCRIPT_START = ticks_ms()

def simulate_data_samples(n=20):
    """Fill buffer with fake averaged samples for test."""
    global write_ptr
    for _ in range(n):
        t = ticks_diff(ticks_ms(), SCRIPT_START)
        v = adc_v.read_u16()
        c = adc_c.read_u16()

        t_buf[write_ptr] = t
        v_buf[write_ptr] = v
        c_buf[write_ptr] = c
        write_ptr = (write_ptr + 1) % BUF_SIZE

def flush_ringbuffer_to_file():
    global read_ptr
    with open(FILENAME, "ab") as f:  # overwrite for test
        while read_ptr != write_ptr:
            v_raw = v_buf[read_ptr]
            c_raw = c_buf[read_ptr]
            t_cs = (t_buf[read_ptr] + 5) // 10  # centiseconds
            f.write(ustruct.pack("<HHH", t_cs, v_raw, c_raw))
            read_ptr = (read_ptr + 1) % BUF_SIZE
    gc.collect()

def read_binary_chunk(chunk_size=10):
    rec_size = 6  # each record is 6 bytes
    try:
        with open(FILENAME, "rb") as f:
            while True:
                raw = f.read(rec_size * chunk_size)
                if not raw:
                    break
                n = len(raw) // rec_size
                lst = []
                for i in range(n):
                    t_cs, v_raw, c_raw = ustruct.unpack_from("<HHH", raw, i * rec_size)
                    t_s = t_cs / 100.0
                    v = v_raw * 3.3 / 65535 * 3.7
                    c = c_raw * 3.3 / 65535
                    lst.append({
                        "v": f"{v:.2f}",
                        "c": f"{c:.2f}",
                        "t": f"{t_s:.2f}"
                    })
                yield lst
    except Exception as e:
        print("❌ failed to unpack chunk:", e)
        return

def test_read_chunks():
    print("📦 Reading data in chunks...")
    for chunk in read_binary_chunk(chunk_size=5):  # adjust chunk size
        print("— Chunk —")
        for record in chunk:
            print(record)

# — MAIN TEST EXECUTION —
simulate_data_samples(20)
flush_ringbuffer_to_file()
test_read_chunks()


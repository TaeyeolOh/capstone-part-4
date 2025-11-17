import struct

with open("recorded_data.bin", "rb") as f:
    raw = f.read()

# each record is 2 B (uint16 cs), 2 B (uint16 v), 2 B (uint16 c) = 6 B
record_size = struct.calcsize("<HHH")
n = len(raw) // record_size

for i in range(n):
    t_cs, v_raw, c_raw = struct.unpack_from("<HHH", raw, i*record_size)
    t_s   = t_cs / 100.0               # convert centiseconds → s
    v     = v_raw * 3.3 / 65535 * 3.7
    c     = c_raw * 3.3 / 65535
    print(f"{i:4d} | t={t_s:6.2f} s | V={v:.2f} V | I={c:.2f} A")

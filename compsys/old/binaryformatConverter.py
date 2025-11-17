import struct

INPUT_FILENAME = "recorded_data.bin"
OUTPUT_TXT = "data.txt"

def decode_and_write_txt_stream(input_filename, output_filename):
    try:
        with open(input_filename, "rb") as f_in, open(output_filename, "w") as f_out:
            f_out.write("time_s,voltage_v,current_a\n")

            record_size = 6
            while True:
                record = f_in.read(record_size)
                if len(record) < record_size:
                    break  # end of file

                t_cs, v_raw, c_raw = struct.unpack("<HHH", record)
                t_s = t_cs / 100.0
                voltage = v_raw * 3.3 / 65535 * 3.7
                current = c_raw * 3.3 / 65535
                f_out.write(f"{t_s:.2f},{voltage:.2f},{current:.2f}\n")

        print(f"✅ Saved TXT to {output_filename}")

    except Exception as e:
        print("❌ Failed to decode binary:", e)

if __name__ == "__main__":
    decode_and_write_txt_stream(INPUT_FILENAME, OUTPUT_TXT)


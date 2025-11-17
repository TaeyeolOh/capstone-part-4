import time
import ujson
from machine import ADC, Pin

adc_voltage = ADC(Pin(26))  # ADC0 - Voltage input
adc_current = ADC(Pin(27))  # ADC1 - Current input
sample_count = 0

# Overwrite JSON file on each run
with open("adc_log.json", "w") as f:
    start = time.ticks_ms()

    f.write("[\n")  # Start of JSON array

    while True:
        raw_v = adc_voltage.read_u16()
        raw_c = adc_current.read_u16()

        voltage = raw_v * 3.3 / 65535
        current = raw_c * 3.3 / 65535
        timestamp = time.ticks_diff(time.ticks_ms(), start)
        power = voltage * current

        # Create a dictionary for this sample
        entry = {
            "time_ms": timestamp,
            "voltage": round(voltage, 4),
            "current": round(current, 4),
            "power" : round(power, 4)
        }

        # Write as JSON
        ujson.dump(entry, f)
        sample_count += 1

        # Add comma+newline unless it's the first sample
        f.write(",\n" if sample_count > 1 else "\n")

        time.sleep(0.01)  # 100 Hz

        if sample_count % 100 == 0:
            print(f"{sample_count} samples logged...")

    # If you ever stop the loop cleanly, add this:
    # f.write("\n]\n")  # End of JSON array

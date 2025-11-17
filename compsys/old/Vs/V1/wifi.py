import uasyncio as asyncio
import network
import urequests
import ujson
from time import ticks_ms, ticks_diff
from machine import ADC, Pin

# --- Wi-Fi Setup ---
SSID = "H_qitai"
PASSWORD = "88888888"
SERVER_URL = "http://192.168.1.100:5000/upload"

wlan = network.WLAN(network.STA_IF)

def wifi_connected():
    return wlan.isconnected()

async def try_connect_wifi():
    if not wifi_connected():
        print("Trying to connect to Wi-Fi…")
        wlan.active(True)
        wlan.connect(SSID, PASSWORD)
        timeout_ms = 3_000                   # 5 seconds in milliseconds
        start = ticks_ms()
        # loop until either connected or timeout expires
        while not wifi_connected() and (ticks_ms() - start) < timeout_ms:
            await asyncio.sleep(0.2)
        if wifi_connected():
            print("Wi-Fi connected:", wlan.ifconfig())
        else:
            print("Wi-Fi connection failed (timeout).")

# --- ADC Setup ---
adc_voltage = ADC(Pin(26))
adc_current = ADC(Pin(27))

def read_sensors():
    voltage_raw = adc_voltage.read_u16()
    current_raw = adc_current.read_u16()
    voltage = voltage_raw * 3.3 / 65535
    current = current_raw * 3.3 / 65535
    power = voltage * current
    
    # round to 3 decimal places
    voltage = round(voltage, 3)
    current = round(current, 3)
    power   = round(power,   3)

    now = ticks_ms()
    elapsed = ticks_diff(now, SCRIPT_START)   # wraps correctly if ticks_ms() overflows
    
    return {
        "voltage": voltage,
        "current": current,
        "power": power,
        "timestamp": elapsed    # now starts at ~0
    }


# --- Local Storage ---
FILENAME = "unsent_data.json"

def save_to_local(data):
    try:
        with open(FILENAME, "r") as f:
            buffer = ujson.loads(f.read())
    except:
        buffer = []
    buffer.append(data)
    with open(FILENAME, "w") as f:
        f.write(ujson.dumps(buffer))
    print("Data saved locally.")

def load_local_data():
    try:
        with open(FILENAME, "r") as f:
            return ujson.loads(f.read())
    except:
        return []

def clear_local_data():
    with open(FILENAME, "w") as f:
        f.write("[]")

# --- Merged Wi-Fi Check and Sending Task ---
async def wifi_and_send_task():
    SEND_INTERVAL = 3  # seconds between attempts
    while True:
        if wifi_connected():
            all_data = load_local_data()
            if not all_data:
                print("No data to send.")
            else:
                try:
                    for entry in all_data:
                        response = urequests.post(SERVER_URL, json=entry)
                        print("Sent:", entry)
                        response.close()
                        await asyncio.sleep(0.1)  # Small gap between sends
                    clear_local_data()
                    print("All saved data sent successfully!")
                except Exception as e:
                    print("Sending failed:", e)
        else:
            print("Wi-Fi not connected, skipping send...")
            await try_connect_wifi()  # Try to reconnect but don't block sampling

        await asyncio.sleep(SEND_INTERVAL)

# --- Sampling Task ---
async def sample_task():
    SAMPLE_INTERVAL = 0.1  # seconds
    while True:
        reading = read_sensors()
        save_to_local(reading)
        await asyncio.sleep(SAMPLE_INTERVAL)


# --- Main Program ---
async def main():
    await asyncio.gather(
        sample_task(),
        wifi_and_send_task()
    )
    
# Mark the moment our measurement session begins
SCRIPT_START = ticks_ms()
asyncio.run(main())
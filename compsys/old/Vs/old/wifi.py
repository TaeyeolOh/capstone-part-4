import network
import urequests
import ujson
import time
from machine import ADC, Pin

# --- Wi-Fi Setup ---
SSID = "H_qitai"
PASSWORD = "88888888"
SERVER_URL = "http://192.168.1.100:5000/upload"

wlan = network.WLAN(network.STA_IF)

def wifi_connected():
    return wlan.isconnected()

def try_connect_wifi():
    if not wifi_connected():
        wlan.active(True)
        wlan.connect(SSID, PASSWORD)
        start = time.time()
        timeout = 0.5  # Shorter timeout
        while not wifi_connected() and time.time() - start < timeout:
            time.sleep(0.2)
    return wifi_connected()

# --- ADC Setup ---
adc_voltage = ADC(Pin(26))
adc_current = ADC(Pin(27))

def read_sensors():
    voltage_raw = adc_voltage.read_u16()
    current_raw = adc_current.read_u16()
    voltage = voltage_raw * 3.3 / 65535
    current = current_raw * 3.3 / 65535
    power = voltage * current
    timestamp = time.time()
    
    print(f"Voltage: {voltage:.3f} V | Current: {current:.3f} A | Power: {power:.3f} W | Time: {timestamp}")
    
    return {
        "voltage": voltage,
        "current": current,
        "power": power,
        "timestamp": timestamp
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

# --- Send Data ---
def try_send_data():
    if not wifi_connected():
        if not try_connect_wifi():
            print("Wi-Fi still not available.")
            return False  # Skip sending

    all_data = load_local_data()
    if not all_data:
        print("No data to send.")
        return True

    try:
        for entry in all_data:
            response = urequests.post(SERVER_URL, json=entry)
            print("Sent:", entry)
            response.close()
        clear_local_data()
        print("All saved data sent successfully!")
        return True
    except Exception as e:
        print("Sending failed:", e)
        return False

# --- Main Loop ---
SAMPLE_INTERVAL = 0.1  # seconds
last_sample_time = time.time()

while True:
    current_time = time.time()

    # Regular sensor sampling
    if current_time - last_sample_time >= SAMPLE_INTERVAL:
        reading = read_sensors()
        save_to_local(reading)
        last_sample_time = current_time

    # Try sending data without blocking
    try_send_data()

    # Short sleep to avoid CPU overload
    time.sleep(0.05)

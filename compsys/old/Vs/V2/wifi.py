import uasyncio as asyncio
import network
import urequests
import ujson
from time import ticks_ms, ticks_diff
from machine import ADC, Pin

# --- Wi-Fi Setup ---
SSID = "H_qitai"
PASSWORD = "88888888"
SERVER_URL = "http://192.168.235.25:5000/upload"

wlan = None

led = Pin("LED", Pin.OUT)
led.off()

def wifi_connected():
    return wlan is not None and wlan.isconnected()

async def try_connect_wifi():
    global wlan

    while not wifi_connected():
        if wlan is not None:
            wlan.active(False)
            await asyncio.sleep(1)

        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        wlan.connect(SSID, PASSWORD)

        timeout_ms = 10_000  # 5 seconds connect try
        start = ticks_ms()

        while not wifi_connected() and (ticks_ms() - start) < timeout_ms:
            print("Connecting...")
            led.toggle()
            await asyncio.sleep(1)
            led.toggle()
            await asyncio.sleep(1)

        if wifi_connected():
            print("✅ Wi-Fi connected:", wlan.ifconfig())
            led.on()
            return  # Exit after successful connection
        else:
            print("❌ Wi-Fi connection failed. Retrying in 1 seconds...")
            led.off()
            await asyncio.sleep(5)  # Wait 3 sec before retrying



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
UNSENT_FILENAME = "unsent_data.json"
RECORD_FILENAME = "recorded_data.json" 

def save_to_local(data):
    # Save to unsent buffer (for retry sending)
    try:
        with open(UNSENT_FILENAME, "r") as f:
            buffer = ujson.loads(f.read())
    except:
        buffer = []
    buffer.append(data)
    with open(UNSENT_FILENAME, "w") as f:
        f.write(ujson.dumps(buffer))
    
    # Save permanently to recorded master file
    try:
        with open(RECORD_FILENAME, "r") as f:
            full_record = ujson.loads(f.read())
    except:
        full_record = []
    full_record.append(data)
    with open(RECORD_FILENAME, "w") as f:
        f.write(ujson.dumps(full_record))
    #print("Saved to local buffer and full record.")
    
def load_local_data():
    try:
        with open(UNSENT_FILENAME, "r") as f:
            return ujson.loads(f.read())
    except:
        return []

def clear_local_data():
    with open(UNSENT_FILENAME, "w") as f:
        f.write("[]")

# --- Merged Wi-Fi Check and Sending Task ---
async def wifi_and_send_task():
    SEND_INTERVAL = 1  # seconds between attempts
    while True:
        if wifi_connected():
            led.on()
            all_data = load_local_data()
            if not all_data:
                print("No data to send.")
            else:
                try:
                    for entry in all_data:
                        response = urequests.post(SERVER_URL, json=entry)
                        print(f"Voltage={entry['voltage']:.3f} V | Current={entry['current']:.3f} A | Power={entry['power']:.3f} W | Timestamp={entry['timestamp']} ms")
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

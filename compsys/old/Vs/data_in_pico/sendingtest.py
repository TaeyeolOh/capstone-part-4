import network
import socket
import time

power_data = [320, 315, 318, 322, 317, 330, 310]  # Example power values (mW)

with open("power_log.txt", "w") as f:
    for value in power_data:
        f.write(str(value) + "\n")

print("power_log.txt created.")

# Wi-Fi credentials
ssid = 'oty'
password = '12345678'

# Connect to Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

# Wait for connection
while wlan.status() != 3:
    print("Connecting to Wi-Fi...")
    time.sleep(1)

print("Connected. IP:", wlan.ifconfig()[0])

# Start socket server
addr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]
s = socket.socket()
s.bind(addr)
s.listen(1)
print("HTTP server listening...")

while True:
    cl, addr = s.accept()
    print("Client connected from", addr)
    request = cl.recv(1024).decode()
    print("Request:", request)

    if "GET /data" in request:
        try:
            with open("adc_log.json", "r") as f:
                file_data = f.read()

            cl.send("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n")
            cl.send(file_data)
        except Exception as e:
            cl.send("HTTP/1.1 500 Internal Server Error\r\n\r\n")
            cl.send("Error reading file: " + str(e))
    else:
        cl.send("HTTP/1.1 404 Not Found\r\n\r\n")
        cl.send("Endpoint not found.")

    cl.close()

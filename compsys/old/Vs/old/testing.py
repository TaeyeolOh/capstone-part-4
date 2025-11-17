import network
import socket
import time
import os

SSID = 'H_qitai'
PASSWORD = '88888888'

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('Connecting to Wi-Fi...')
        wlan.connect(SSID, PASSWORD)
        while not wlan.isconnected():
            time.sleep(0.5)
    print('Connected to Wi-Fi, IP address:', wlan.ifconfig()[0])

def serve_file():
    # Path to the file you want to send
    file_path = '/myfile.txt'

    # Check if the file exists
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            file_data = f.read()
    else:
        file_data = "File not found."

    return file_data

def start_server():
    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    print('Listening on', addr)

    while True:
        cl, addr = s.accept()
        print('Client connected from', addr)
        request = cl.recv(1024)
        print('Request received:', request)

        # Check if the client is requesting the file
        if b'GET /file' in request:
            response_data = serve_file()
            response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n' + response_data
        else:
            response = 'HTTP/1.1 404 Not Found\r\n\r\nFile Not Found'

        cl.send(response)
        cl.close()

def main():
    connect_wifi()
    start_server()

main()
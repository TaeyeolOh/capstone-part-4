from machine import Pin
from time import sleep

led = Pin("LED", Pin.OUT)  # Use "LED" alias for onboard LED

while True:
    led.toggle()
    sleep(0.5)
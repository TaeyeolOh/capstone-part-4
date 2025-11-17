import micropython, uasyncio as asyncio, network, urequests, ustruct
from machine import ADC, Pin, Timer, unique_id
from time import ticks_ms, ticks_diff

micropython.alloc_emergency_exception_buf(100)
SSID="H_qitai"; PASSWORD="88888888"; F="recorded_data.bin"
SERIAL="".join(str(ord(c)) for c in str(unique_id()))
BUF=1024; vb=[0]*BUF; cb=[0]*BUF; tb=[0]*BUF
w=r=0; qc=sv=sc=st=0
SCRIPT_START=ticks_ms()
adc_v=ADC(Pin(27)); adc_c=ADC(Pin(26))
wlan=None; server_ip=""

async def connect():
    global wlan, server_ip
    if wlan: wlan.active(False)
    wlan=network.WLAN(network.STA_IF); wlan.active(True); wlan.connect(SSID,PASSWORD)
    for _ in range(6):
        await asyncio.sleep(0.5)
        if wlan.isconnected():
            ip,mask,*_=wlan.ifconfig()
            pp=list(map(int,ip.split('.')))
            mp=list(map(int,mask.split('.')))
            server_ip=".".join(str(o) if m else "77" for o,m in zip(pp,mp))
            return

async def send_task():
    global r,w
    while True:
        # flush to bin
        with open(F,"ab") as f:
            while r!=w:
                t_cs=(tb[r]+5)//10
                f.write(ustruct.pack("<HHH",t_cs,vb[r],cb[r]))
                r=(r+1)%BUF
        # send JSON
        if not wlan or not wlan.isconnected():
            await connect()
        else:
            raw=open(F,"rb").read(); n=len(raw)//6; L=[]
            for i in range(n):
                t_cs,v_raw,c_raw=ustruct.unpack_from("<HHH",raw,i*6)
                L.append({
                    "v":f"{v_raw*3.3/65535*3.7:.2f}",
                    "c":f"{c_raw*3.3/65535:.2f}",
                    "t":f"{t_cs/100:.2f}"
                })
            urequests.post(f"http://{server_ip}:8080/api/ecus/bulk/{SERIAL}",json=L).close()
            open(F,"wb").close()
        await asyncio.sleep(0.5)

def _sample_cb(_):
    micropython.schedule(_handle,0)
def _handle(_):
    global w,qc,sv,sc,st
    v=adc_v.read_u16(); c=adc_c.read_u16(); t=ticks_diff(ticks_ms(),SCRIPT_START)
    sv+=v; sc+=c; st+=t; qc+=1
    if qc==4:
        vb[w]=sv//4; cb[w]=sc//4; tb[w]=st//4
        w=(w+1)%BUF; qc=sv=sc=st=0

timer=Timer(); timer.init(freq=100,mode=Timer.PERIODIC,callback=_sample_cb)

async def main():
    open(F,"wb").close()
    await connect()
    await asyncio.gather(send_task())

asyncio.run(main())

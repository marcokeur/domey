#!/usr/bin/python
import signal
import serial
import sys
import daemon
from socket import *

baud_rate = 115200
udp_ip = "127.0.0.1"
udp_port = 1884
serial_port = "/dev/ttyAMA0"

def send(msg, ip, port):
    socket(AF_INET,SOCK_DGRAM).sendto(msg, (ip, port))

def doMain():
	s = serial.Serial( serial_port, baud_rate, timeout=1 )
	while (1):
        	line = s.readline()

        	if (line != ''):
			send( line, udp_ip, udp_port )

def stop(signum, frame):
	s.close()
	sys.exit(0)
	
def start():
	context = daemon.DaemonContext()
	context.signal_map = { signal.SIGTERM: stop }

    	context.open()
    	
    	with context:
        	doMain()

if __name__ == "__main__":
	start()

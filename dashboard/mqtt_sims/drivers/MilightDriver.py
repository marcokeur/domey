MYPORT = 8899
DRIVERNAME = "MiLight"

import sys, time
from socket import *
import paho.mqtt.client as mqtt

s = socket(AF_INET, SOCK_DGRAM)
s.bind(('', 0))
s.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

def getName():
	return DRIVERNAME

def toMqtt(line, mqttc):
	print "line to mqtt"

def on_message(client, userdata, msg):
	if msg.topic == "pit/livingroom/lights/action":
		if msg.payload == "on":
			print "Turing lights in livingroom on"	
			data = bytearray([0x42, 0x03, 0x55])
			s.sendto(data, ('255.255.255.255', MYPORT))
			client.publish("pit/livingroom/lights/state", "on");
		else:
			print "Turing lights in livingroom off"
                        data = bytearray([0x41, 0x03, 0x55])
                        s.sendto(data, ('255.255.255.255', MYPORT))
                        client.publish("pit/livingroom/lights/state", "off");
		return True

# Send UDP broadcast packets

MYPORT = 8899

import sys, time
from socket import *
import paho.mqtt.client as mqtt

s = socket(AF_INET, SOCK_DGRAM)
s.bind(('', 0))
s.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

def on_connect(client, userdata, flags, rc):
    print "Connected";

def on_message(client, userdata, msg):
	print "msg"
	if msg.payload == "on":
    		dataOn = bytearray([0x42, 0x03, 0x55])
    		s.sendto(dataOn, ('255.255.255.255', MYPORT))
                client.publish("pit/test/button/state", "on");
	else:
    		dataOff = bytearray([0x41, 0x03, 0x55])
	    	s.sendto(dataOff, ('255.255.255.255', MYPORT))
                client.publish("pit/test/button/state", "off");

#create a broker
client = mqtt.Client()

#define the callbacks
client.on_message = on_message
client.on_connect = on_connect

#connect
client.connect("test.mosquitto.org", 1883, 60)

#subscribe to topic test
client.subscribe("pit/test/button/action", 2)

#keep connected to broker
client.loop_forever()

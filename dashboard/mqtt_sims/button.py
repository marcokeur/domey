#!/usr/bin/python

#import pynotify
import mosquitto
import time
#define what happens after connection
def on_connect(client, userdata, flags):
    print "Connected";

#On recipt of a message create a pynotification and show it
def on_message(client, userdata, msg):
	print msg.payload;
	time.sleep(1);
	if msg.payload == "on":
                mqttc.publish("revspace/test/testbutton/state", "on");
		print("switch state to on");
#		time.sleep(3);
#		mqttc.publish("revspace/test/testbutton/state", "off");
#		print("switch state to off");
	else:
                mqttc.publish("revspace/test/testbutton/state", "off");
#                time.sleep(3);
#                mqttc.publish("revspace/test/testbutton/state", "on");

#create a broker
mqttc = mosquitto.Mosquitto("python_sub")

#define the callbacks
mqttc.on_message = on_message
mqttc.on_connect = on_connect

#connect
mqttc.connect("test.mosquitto.org", 1883, 60, True)

#subscribe to topic test
mqttc.subscribe("revspace/test/testbutton/action", 2)

#keep connected to broker
while mqttc.loop() == 0:
    pass

#!/usr/bin/python
 
import mosquitto
import os
import time
 
broker = "localhost"
port = 1883

def sensor(x):
	return {
		'\x01' : "/counter",
		'\x02' : "/temperature",
		'\x03' : "/humidity",
	}.get(x, "")

def node(x):
	return {
		'\x02' : "living/roomnode",
		'\x03' : "kitchen/roomnode",
	}.get(x, "")


def on_message(mosq, obj, msg):
	try:
		if node(msg.topic[0]) != "" and sensor(msg.topic[1]) != "":
			print msg.topic + ": " + msg.payload + " -> " + "pit/" + node(msg.topic[0]) + sensor(msg.topic[1])
			mqttc.publish("pit/" + node(msg.topic[0]) + sensor(msg.topic[1]), msg.payload, 0, True)
	except (NameError, IndexError):
		print "topic to short or error"


mypid = os.getpid()
client_uniq = "pubclient_"+str(mypid)

mqttc = mosquitto.Mosquitto() 
mqttc.on_message = on_message

#connect to broker
mqttc.connect(broker, port, 60)

mqttc.subscribe("#", 0)
 
#remain connected and publish
while mqttc.loop() == 0:
    #msg = "test message "+time.ctime()
    #mqttc.publish("/timesample", msg, 0, True) #qos=0, retain=y
    #print "message published"
    #time.sleep(1.5)
    pass

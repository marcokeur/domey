#!/usr/bin/python
import daemon
import signal
import mosquitto
import os
import time
import ConfigParser

mqttc = mosquitto.Mosquitto() 
 
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

def doMain():
	config = ConfigParser.RawConfigParser()
	config.read('/etc/support_package/config.ini')
	
	mqtt_host = config.get('general', 'mqtt_host')
	mqtt_port = config.get('general', 'mqtt_port')
	
	mypid = os.getpid()
	client_uniq = "pubclient_"+str(mypid)

	mqttc.on_message = on_message

	#connect to broker
	mqttc.connect(mqtt_host, mqtt_port, 60)

	mqttc.subscribe("#", 0)
 
	#remain connected and publish
	while mqttc.loop() == 0:
	    pass
    
def stop(signum, frame):
	sys.exit(0)
	
def start():
	context = daemon.DaemonContext()
	context.signal_map = { signal.SIGTERM: stop }

    	context.open()
    	
    	with context:
        	doMain()

if __name__ == "__main__":
	start()


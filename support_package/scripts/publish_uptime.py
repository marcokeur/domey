#!/usr/bin/python
#
# simple script to repeatedly publish an MQTT message
#
# uses the Python MQTT client from the Paho project
# http://eclipse.org/paho
#
# Andy Piper @andypiper http://andypiper.co.uk
# 
# 2011/09/15 first version 
# 2012/05/28 updated to use new pure python client from mosquitto 
# 2014/02/03 updated to use the Paho client 
#
# pip install paho-mqtt
# python blast.py
 
import mosquitto
#import paho.mqtt.client as paho
import os
import time
 
broker = "localhost"
port = 1883
 
mypid = os.getpid()
client_uniq = "pubclient_"+str(mypid)
#mqttc = paho.Client(client_uniq, False) #nocleanstart
mqttc = mosquitto.Mosquitto() 
#connect to broker
mqttc.connect(broker, port, 60)
 
#remain connected and publish
while mqttc.loop() == 0:
    load = os.system("uptime")

    msg = "test message load " + str(load)
    mqttc.publish("/load", msg, 0, True) #qos=0, retain=y
    print "message published"
    time.sleep(1.5)
    pass

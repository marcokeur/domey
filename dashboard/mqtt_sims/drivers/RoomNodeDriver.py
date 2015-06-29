#DRIVER_NAME = "RoomNode"
def getName():
	return "RoomNode"

def toMqtt(line, mqttc):
	print "line to mqtt"

def on_message(client, userdata, msg):
	print msg.payload

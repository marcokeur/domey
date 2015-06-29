import imp
import os
import paho.mqtt.client as mqtt

MODULE_EXTENSIONS = ('.py', '.pyc', '.pyo')

moduleList = []

def package_contents(package_name):
    file, pathname, description = imp.find_module(package_name)
    if file:
        raise ImportError('Not a package: %r', package_name)
    # Use a set because some may be both source and compiled.
    return set([os.path.splitext(module)[0]
        for module in os.listdir(pathname)
        if module.endswith(MODULE_EXTENSIONS)])

def my_import(name):
	m = __import__(name)
	for n in name.split(".")[1:]:
		m = getattr(m, n)
	return m

for module in package_contents("drivers"):
	if module != "__init__":
		print module
		m = my_import("drivers." + module);
		moduleList.append(m)
		print "Loaded driver for " + getattr(m, 'getName')()


def on_message(client, userdata, msg):
	print "msg: " + msg.payload

	for module in moduleList:
		ret = getattr(module, 'on_message')(client, userdata, msg)
		if ret:
			print "msg handeled by " + getattr(m, 'getName')()

def on_connect(client, userdata, flags, rc):
    print "Connected";

#create a broker
client = mqtt.Client()

#define the callbacks
client.on_message = on_message
client.on_connect = on_connect

#connect
client.connect("test.mosquitto.org", 1883, 60)

#subscribe to topic test
client.subscribe("pit/#", 2)

#keep connected to broker
client.loop_forever()

import serial
import mosquitto

ser = serial.Serial('/dev/ttyUSB1', 57600, timeout=1);
mqttc = mosquitto.Mosquitto("python_sub")

while True:
	mqttc.connect("test.mosquitto.org", 1883, 60, True)

	while mqttc.loop() == 0:
		line = ser.readline()
		if line.startswith("OK") :
#			dtstamp = strftime("%Y%m%d%H%M%S")
			# Raw data packets
			data = line.split(" ")
			group = data[2]
			a = int(data[3]) 
			b = int(data[4])
			c = int(data[5])
			d = int(data[6])
			# Decode raw data
			node_id     = str(int(data[2]) & 0x1f)
			light       = int(float(a) / 255 * 100)
			motion      = b & 1
			humidity    = b >> 1
			temperature = str(((256 * (d&3) + c) ^ 512) - 512)
			temperature = temperature[0:2] + '.' + temperature[-1]
			timereq     = (d >> 2) & 1
			# Print our output to stdout
			print "Node:{} Temp:{} Humi:{} Light:{} Motion:{}", str(node_id), str(temperature), str(humidity), str(light), str(motion)
			
			location = "unknown"

			if node_id == "1":
				location = "office"
			elif node_id == "2":
				location = "livingroom"
		
			mqttc.publish("pit/" + location + "/roomnode/light", str(light));
			mqttc.publish("pit/" + location + "/roomnode/temperature", str(temperature));
			mqttc.publish("pit/" + location + "/roomnode/motion", str(motion));

#!/usr/bin/python

import sys
import subprocess
import signal
import time
import os
#import daemon

processList = []

def startScripts():
        print "Launching scripts"
        processList.append(subprocess.Popen(['python', 'scripts/publish_uptime.py']))
        processList.append(subprocess.Popen(['python', 'scripts/republish_short_topics.py']))
	processList.append(subprocess.Popen(['python', 'scripts/serial_to_udp.py', '/dev/ttyAMA0', 'localhost', '1884']))
#        processList.append(subprocess.Popen(['python', 'scripts/weather_publisher.py', 'NLXX0037']))

def stopScripts():
        for process in processList:
                process.terminate()


def signal_handler(signal, frame):
        print 'got SIGTERM'
        stopScripts()
        sys.exit(0)

def main():
        signal.signal(signal.SIGINT, signal_handler)

        startScripts()
        while True:
                time.sleep(1)


def run():
	#with daemon.DaemonContext():
		main()

if __name__ == "__main__":
    run()

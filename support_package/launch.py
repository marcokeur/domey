import sys
import subprocess
import signal
import time
import os

processList = []

def startScripts():
        print "Launching scripts"
        processList.append(subprocess.Popen(['watch', 'ls']))
        processList.append(subprocess.Popen(['watch', 'df']))
        processList.append(subprocess.Popen(['watch', 'uptime']))

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



if __name__ == "__main__":
    main()

# Send UDP broadcast packets

MYPORT = 8899

import sys, time
from socket import *

s = socket(AF_INET, SOCK_DGRAM)
s.bind(('', 0))
s.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

while 1:
    dataOn = '\x45\x00\x55'
    s.sendto(data, ('<broadcast>', MYPORT))
    time.sleep(2)
    dataOff = '\x39\x00\x55'
    s.sendto(data, ('<broadcast>', MYPORT))
    time.sleep(2)

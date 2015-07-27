Domey
========
Based on the idea's behind Homey, i've developed a system called Domey. Domey is a NodeJS based home automation
framework. Currently there is support for the following interfaces;
* MQTT
* JeeNode
* Raspberries GPIO

Modules for various devices can be created on top of these interfaces. A Domey module is called a Thing. The following
things are currently build in.
* Milight
* ESP8266 MQTT roomba controller
* JeeLabs RoomNode

A Thing consists of a driver for a physical device (a Domey device is an instance of a driver) and callbacks to support
flow behavoir (like "If this then that").

Currently working on support for the following:
* HomeKit
* Graphing
* Calling flow actions from web UI

[![Build Status](https://travis-ci.org/marcokeur/domey.svg?branch=master)](https://travis-ci.org/marcokeur/domey)

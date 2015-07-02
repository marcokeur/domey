Domotica
========
This repository holds all code that is used for my home domotica system. It consists of various components that will be explained here.


/embedded                           <- contains sourcecode from various sensors & acutators

dashboard                          <- contains the frontend and middleware (mqtt stuff and
                                            mongodb database)
                                            
connector
The connector folder holds a nodejs application that is used to connect MQTT with the physical world. It has various drivers i.e. a jee driver to connect with jeenodes, a MiLight driver to connect with my MiLights and a driver that pulls the weather forecast from the internet and publishes it on MQTT.

The jee driver is a bit special. Because a single jeenode on the raspberry side can communicatie with multiple jeenodes that send and receive data in various ways, there are decoders that can decode the data from a type of node. For example the roomnode has a decoder that decodes the incoming datapackets to a javascript array with topics and payload for each sensor in the roomnode.

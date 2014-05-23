/*
  MQTT-SN command-line publishing client
  Copyright (C) 2013 Nicholas Humfrey

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <string.h>
#include <stdint.h>
#include <unistd.h>
#include <signal.h>

#include <JeeLib.h>

uint8_t debug = true;
static uint16_t next_message_id = 1;

#define NODE_ID  0x02
#define COUNTER_ID  0x01
 
#define MQTT_SN_MAX_PACKET_LENGTH    (255)
#define MQTT_SN_TYPE_PUBLISH         (0x0C)
#define MQTT_SN_FLAG_RETAIN          (0x1 << 4)
#define MQTT_SN_FLAG_QOS_N1          (0x3 << 5)
#define MQTT_SN_SHORT_TOPIC_TYPE     (0x02 & 0x3)
#define MQTT_SN_HEADER_LENGTH        (0x07)

typedef struct __attribute__((packed)) {
    uint8_t length;
    uint8_t type;
    uint8_t flags;
    uint16_t topic_id;
    uint16_t message_id;
    char data[MQTT_SN_MAX_PACKET_LENGTH-7];
} publish_packet_t;


//void mqtt_sn_send_publish(uint16_t topic_id, uint8_t topic_type, const char* data, int8_t qos, uint8_t retain)
void mqtt_sn_publish(uint16_t topic_id, const char * data, uint8_t retain)
{
    publish_packet_t packet;
    size_t data_len = strlen(data);
    
    if (data_len <= sizeof(packet.data)) {   
      packet.type = MQTT_SN_TYPE_PUBLISH;                                        
      packet.flags = 0x00;
      if (retain)
          packet.flags += MQTT_SN_FLAG_RETAIN;     
      packet.flags += MQTT_SN_FLAG_QOS_N1;   
      packet.flags += MQTT_SN_SHORT_TOPIC_TYPE;                                 //Topic_id_type & ??
      packet.topic_id = topic_id;
      packet.message_id = next_message_id++;
      strncpy(packet.data, data, sizeof(packet.data));
      packet.length = MQTT_SN_HEADER_LENGTH + data_len;
      
      if (debug){
          Serial.print("Sending PUBLISH packet: ");
              for (byte i = 0; i < packet.length; ++i) {
                Serial.print(' ');
                Serial.print((int)((char *)&packet)[i]);
              }
          Serial.print("...\n");
      }

      rf12_sendStart(0, (char*)&packet, packet.length);
    }
}

void setup()
{
    // Enable debugging?
    //mqtt_sn_set_debug(debug);
    rf12_initialize(NODE_ID, RF12_868MHZ, 33);
    Serial.begin(115200);
    
      // if analog input pin 0 is unconnected, random analog
  // noise will cause the call to randomSeed() to generate
  // different seed numbers each time the sketch runs.
  // randomSeed() will then shuffle the random function.
  randomSeed(analogRead(0));
}

int counter = 0;

void loop(){
        counter++;

        char message_data[40];
        sprintf(message_data, "%d", counter);
        
        //byte sensorId = 0x61;
        
        // Convert the 2 character topic name into a 2 byte topic id
        uint16_t topic_id = (COUNTER_ID << 8) + NODE_ID;
        
        

        mqtt_sn_publish(topic_id, message_data, false);
        
        delay(random(1000, 10000));

}

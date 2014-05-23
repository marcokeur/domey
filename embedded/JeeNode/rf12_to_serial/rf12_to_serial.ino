#include <JeeLib.h>
#include <RF12sio.h>

RF12 RF12;

void setup() {
  rf12_initialize(2, RF12_868MHZ, 33); 
  Serial.begin(115200);
    
}

void loop() {
    if (rf12_recvDone()) {
        byte n = rf12_len;
        if (rf12_crc == 0){
                Serial.write((const uint8_t*)rf12_data, rf12_data[0]);
                Serial.flush();
        }
    }
}


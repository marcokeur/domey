#include <stdlib.h>
#include <stdio.h>

#include "gpio_lib.h"
#define PD0    SUNXI_GPD(0)
#define PD1    SUNXI_GPD(1)
#define PD2    SUNXI_GPD(2)
#define PD3    SUNXI_GPD(3)
#define PD4    SUNXI_GPD(4)
#define PD5    SUNXI_GPD(5)
#define PD6    SUNXI_GPD(6)
#define PD7    SUNXI_GPD(7)
#define PD8    SUNXI_GPD(8)
#define PD9    SUNXI_GPD(9)
#define PD10    SUNXI_GPD(10)
#define PD11    SUNXI_GPD(11)
#define PD12    SUNXI_GPD(12)
#define PD13    SUNXI_GPD(13)
#define PD14    SUNXI_GPD(14)
#define PD15    SUNXI_GPD(15)
#define PD16    SUNXI_GPD(16)
#define PD17    SUNXI_GPD(17)
#define PD18    SUNXI_GPD(18)
#define PD19    SUNXI_GPD(19)
#define PD20    SUNXI_GPD(20)
#define PD21    SUNXI_GPD(21)
#define PD22    SUNXI_GPD(22)
#define PD23    SUNXI_GPD(23)
#define PD24    SUNXI_GPD(24)
#define PD25    SUNXI_GPD(25)
#define PD26    SUNXI_GPD(26)
#define PD27    SUNXI_GPD(27)

#define MISO    SUNXI_GPE(3)
#define MOSI    SUNXI_GPE(2)
#define SCK     SUNXI_GPE(1)
#define CS      SUNXI_GPE(0)

int main()
{
    if(SETUP_OK!=sunxi_gpio_init()){
        printf("Failed to initialize GPIO\n");
//        return -1;
    }

    if(SETUP_OK!=sunxi_gpio_set_cfgpin(PD1,OUTPUT)){
        printf("Failed to config GPIO pin\n");
//        return -1;
    }

//https://code.google.com/p/arduino-nodo/issues/detail?id=33

    #define T   350
    #define T3  1050
    #define T32 11200


    int code[] = {0,0,1,1,0,0,0,0,0,1,1,0}; //(12=M) (0=1) (3 onbekende bits) (0=uit)

    int i, x;
 
    for(x=0; x<5; x++){

	for(i=0; i<12; i++){
            sunxi_gpio_output(PD1,HIGH);
            usleep(T);
            sunxi_gpio_output(PD1,LOW);
            usleep(T3);

	    if(code[i] == 1){
	        sunxi_gpio_output(PD1,HIGH);
      		usleep(T3);
        	sunxi_gpio_output(PD1,LOW);
        	usleep(T);
	    }else{
	        sunxi_gpio_output(PD1,HIGH);
                usleep(T);
                sunxi_gpio_output(PD1,LOW);
                usleep(T3);
	    }

	}
	sunxi_gpio_output(PD1,HIGH);
        usleep(T);
	sunxi_gpio_output(PD1,LOW);
        usleep(T32);
    }

    printf("tx: ");
    for(i=0; i<12; i++){
	printf("%i", code[i]);
    }
    printf("\n");
//        if(sunxi_gpio_output(PD1,HIGH)){
//            printf("Failed to set GPIO pin value\n");
//            return -1;
//        }

    sunxi_gpio_cleanup();

    return 0;

}



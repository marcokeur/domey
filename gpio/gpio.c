#include <stdlib.h>
#include <stdio.h>

#include "gpio_lib.h"
#define PD0    SUNXI_GPD(0)
#define PD1    SUNXI_GPD(1)
#define PD2    SUNXI_GPD(2)
#define PD3    SUNXI_GPD(3)
#define PD4    SUNXI_GPD(4)
#define MISO    SUNXI_GPE(3)
#define MOSI    SUNXI_GPE(2)
#define SCK     SUNXI_GPE(1)
#define CS      SUNXI_GPE(0)

int main()
{
    if(SETUP_OK!=sunxi_gpio_init()){
        printf("Failed to initialize GPIO\n");
        return -1;
    }

    if(SETUP_OK!=sunxi_gpio_set_cfgpin(PD01,OUTPUT)){
        printf("Failed to config GPIO pin\n");
        return -1;
    }

    int i;
    for(i=0;i<5;i++){
        if(sunxi_gpio_output(PD01,HIGH)){
            printf("Failed to set GPIO pin value\n");
            return -1;
        }

        usleep(500000);
        if(sunxi_gpio_output(PD01,LOW)){
            printf("Failed to set GPIO pin value\n");
            return -1;
        }
        usleep(500000);
    }

    sunxi_gpio_cleanup();

    return 0;

}

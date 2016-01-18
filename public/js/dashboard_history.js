function createHistoryGraph(){
    $.getJSON('/api/persistence/org.openweathermap/weather/system/pressure', function(data){
        var values = [];
        var values2 = [];

        $.each(data.response, function(key, value){
            values.push(parseInt(value.capabilityEvent.value));
        });

        $.getJSON('/api/persistence/org.openweathermap/weather/system/temp', function(data){

            $.each(data.response, function(key, value){
                values2.push(parseInt(value.capabilityEvent.value));
            });

            $('#weatherGraph').highcharts({
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: 'Weatheronline temperature and pressure'
                },
                subtitle: {
                    //text: 'Source: WorldClimate.com'
                },
                xAxis: [{
                    //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    //    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    //crosshair: true
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '{value}°C',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: 'Temperature',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    }
                }, { // Secondary yAxis
                    title: {
                        text: 'Pressure',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value} mBar',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    x: 120,
                    verticalAlign: 'top',
                    y: 100,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [{
                    name: 'Pressure',
                    type: 'column',
                    yAxis: 1,
                    data: values,
                    tooltip: {
                        valueSuffix: ' mBar'
                    }

                }, {
                    name: 'Temperature',
                    type: 'spline',
                    data: values2,
                    tooltip: {
                        valueSuffix: '°C'
                    }
                }]
            });
        });
    });
}
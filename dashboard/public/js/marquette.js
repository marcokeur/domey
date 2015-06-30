var textfill_config = {
    innerTag: 'span',
    minFontPixels: 6,
    maxFontPixels: 0
};

$.postJSON = function (url, data, callback) {
    return jQuery.ajax({
        'type': 'POST',
        'url': url,
        'contentType': 'application/json',
        'data': $.toJSON(data),
        'dataType': 'json',
        'success': callback
    });
};

$(function () { //DOM Ready

    $.getJSON("tiles", function (tiles) {
        var container = $('#tiles');
        $.each(tiles, function (i, tile) {
            var item = $("<li></li>").attr('id', "tile" + i).addClass('tile');
            $.each(tile, function (k, v) {
                item.data(k, v)
            });

            if (tile.type == 'button') {
                var button = $('<div class="button"></div>').attr('type', 'button');
                button.attr('state', 'off');
                //button.text('Off');
                button.on("click", function (event) {
                    if (button.attr('state') == 'off') {
                        $.postJSON('/topics/' + tile.publish_topic, {
                            payload: "on"
                        });
                    } else {
                        $.postJSON('/topics/' + tile.publish_topic, {
                            payload: "off"
                        });
                    }
                });
                button.appendTo(item);
                item.append("<label>" + tile.name + '</label>');
            } else if (tile.type == 'text') {
                item.append('<div class="text"><span></span></div>');
                item.append('<label>' + tile.name + " (" + tile.unit + ')</label>');
            } else {
                item.html("Unknown tile type: " + tile.type);
            }
            item.appendTo(container);
        });
    });
    
    var resolution = "week";
    var currentTile = "";
    var currentChart;
    $("#modalLeft").click(function(event){
        currentChart.destroy();
        if(resolution == "month"){
            resolution = "week";
        }else if(resolution == "week"){
           resolution = "day";
        }
        
        showChart(currentTile);
    });
    
    $("#modalRight").click(function(event){
        currentChart.destroy();
        if(resolution == "day"){
            resolution = "week";
        }else if(resolution == "week"){
           resolution = "month";
        }
        
        showChart(currentTile);
    });

    $(document).on("click", ".tile > .text", function (event) {
        resolution = "week";
        
        currentTile = $(event.target).parent().parent();
        
        showChart(currentTile);
                $("#modalbox").modal();

    });
        
        function showChart(tile){
                    var ctx = $("#modalChart").get(0).getContext("2d");
                    var data = [];   
                    var labels = [];    

                    $.getJSON("/history/"+ resolution + "/" + tile.data('subscribe_topic'),                                     function(events) {
                                $.each(events, function(i, event) {
                                    data.push(event["value"].substring(0, 3));
                                    labels.push(event["when"]['hour']  + ":" + 
                                                event["when"]['minute']+ " " +
                                                event["when"]["day"]   + "/" + 
                                                event["when"]["month"] + "/" +
                                                event["when"]["year"]);
                                });
                                var lineChartData = {
                                    labels: labels,
                                    datasets: [
                                        {
                                            fillColor: "rgba(220,220,220,0.2)",
                                            strokeColor: "rgba(220,220,220,1)",
                                            pointColor: "rgba(220,220,220,1)",
                                            pointStrokeColor: "#fff",
                                            pointHighlightFill: "#fff",
                                            pointHighlightStroke: "rgba(220,220,220,1)",
                                            data: data
                                        }
                                    ]
                                };

                             currentChart = new Chart(ctx).Line(lineChartData, {});

                        }
                    );
        
        }
                            
        
        
        
   // });

    FastClick.attach(document.body);

    var source = new EventSource('/update-stream');
    console.log("EventSource=" + source);

    source.onopen = function (e) {
        console.log("EventSource connection open");
    };

    source.onerror = function (e) {
        console.log("Event source error: " + e);
    };

    source.onmessage = function (e) {
        console.log(e.data);
        var obj = JSON.parse(e.data);
        $('.tile').each(function () {
            var tile = $(this);
            var div = tile.children('div');
            if (tile.data('subscribe_topic') == obj.topic) {
                if (div.hasClass('text')) {
                    var text = tile.find('.text');
                    if (text) {
                        text.html('<span>' + obj.payload + '</span>');
                        text.textfill(textfill_config);

                        var thresholds = tile.data('thresholds');
                        var value = obj.payload;//.replace(/\D+/g, '');
                        if (thresholds) {
                            if (value <= thresholds['low']) {
                                text.css('color', '#1C94C4');
                            //} else if (value < thresholds['mid']) {
                            //    text.css('color', '#FF8000');
                            } else if (value >= thresholds['high']) {
                                text.css('color', '#FF3333');
                            }
                        }
                    }
                } else if (div.hasClass('button')) {
                    var button = tile.find('.button');
                    if (obj.payload == 'off') {
                        button.attr('state', "off");
                        button.text('Off');
                    } else if (obj.payload == "on") {
                        button.attr('state', 'on');
                        button.text('On');
                    } else {
                        //some error ??   
                    }
                }
            }
        });
    };

});
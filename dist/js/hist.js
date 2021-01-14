var dataset = [];
var lineStyle = {
    normal: {
        width: 2,
        opacity: 1,
        color: 'rgb(137, 167, 152)'
    }
};
var fiveCate = ["Political", "Financial", "Personnel", "Operational", "Procurement"];
//var colorArr = ['#F9713C', '#B3E4A1', 'rgb(238, 197, 102)'];
// based on prepared DOM, initialize echarts instance
var myChart = echarts.init(document.getElementById('main'));
window.onresize = function () {
    myChart.resize();
}

var url = new URL(window.location.href);
var param_t = url.searchParams.get("type");
//console.log(param_t);
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}
$(function() {
  var selectText = "#type-"+((param_t=="15")?"15":"20");
  $(selectText).addClass("active");
});

//data8 2015+2020拆題
//data9 2015+2020合併
var csvpath = "/dist/js/data"+((param_t=="15")?"9":"8")+"_y.csv";

d3.csv(csvpath, function(newDataset){
    
    var nestData =  d3.nest()
          .key(function(d) { return d.country.capitalize()+"-"+d.year; })
          .sortKeys(d3.ascending)
          .rollup(function(v){
              var dataObj = {0:0,1:0,2:0,3:0,4:0};
              var obj = d3.nest().key(function(dd) {
                  return +dd.score
              }).rollup(function(vv){return vv.length}).entries(v);
              
              obj.forEach(function(fd){
                  dataObj[fd['key'].toString()]=fd['values'];
              });
              return dataObj
          })
          .entries(newDataset);
//    console.log(newDataset);
//    console.log(nestData);
    
    var labelArr = nestData.map(function(d){
        return d['key'];
    });
    
    
    var posList = [
        'left', 'right', 'top', 'bottom',
        'inside',
        'insideTop', 'insideLeft', 'insideRight', 'insideBottom',
        'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'
    ];
    
    var app ={};
    app.configParameters = {
        rotate: {
            min: -90,
            max: 90
        },
        align: {
            options: {
                left: 'left',
                center: 'center',
                right: 'right'
            }
        },
        verticalAlign: {
            options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
            }
        },
        position: {
            options: echarts.util.reduce(posList, function (map, pos) {
                map[pos] = pos;
                return map;
            }, {})
        },
        distance: {
            min: 0,
            max: 100
        }
    };

    app.config = {
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
        distance: 15,
        onChange: function () {
            var labelOption = {
                normal: {
                    rotate: app.config.rotate,
                    align: app.config.align,
                    verticalAlign: app.config.verticalAlign,
                    position: app.config.position,
                    distance: app.config.distance
                }
            };
            myChart.setOption({
                series: [{
                    label: labelOption
                }, {
                    label: labelOption
                }, {
                    label: labelOption
                }, {
                    label: labelOption
                }]
            });
        }
    };


    var labelOption = {
        show: true,
        position: app.config.position,
        distance: app.config.distance,
        align: app.config.align,
        verticalAlign: app.config.verticalAlign,
        rotate: app.config.rotate,
        formatter: '{c}  {name|{a}}',
        fontSize: 16,
        rich: {
            name: {
                textBorderColor: '#fff'
            }
        }
    };
    
    var selectedDict = {};
    var seriesArr = nestData.map(function(d){
        var sumOfQuestion = Object.keys(d['values']).reduce((sum,key)=>sum+(d['values'][key]||0),0)*0.01;
        selectedDict[d['key']] = false;
        return {
            name: d['key'],
            type: 'bar',
            barGap: 0,
            label: labelOption,
            data: [(d['values'][0]/sumOfQuestion).toFixed(2),(d['values'][1]/sumOfQuestion).toFixed(2),(d['values'][2]/sumOfQuestion).toFixed(2),(d['values'][3]/sumOfQuestion).toFixed(2),(d['values'][4]/sumOfQuestion).toFixed(2)]
        };
    });
    
//    console.log(seriesArr);
    selectedDict['Taiwan-2015'] = true;
    selectedDict['Taiwan-2020'] = true;

    var option = {
//        color: ['#003366', '#006699', '#4cabce', '#e5323e'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        title: {
            top: 20,
            text: '互動式得分直方圖 ('+((param_t=="15")?"合併版":"拆題版")+"2015+2020)",
            left: 'center',
            textStyle: {
                color: '#222'
            }
        },
        legend: {
            type: "scroll",
            left: 10,
            top: 40,
            bottom: 20,
            width: '20%',
            orient :'vertical',
            data: labelArr,
            selector: [
                {
                    type: 'all',
                    title: 'Select All'
                },
                {
                    type: 'inverse',
                    title: 'Inverse'
                }
            ],
            selected: selectedDict,
            selectedMode: 'multiple'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        xAxis: [
            {
                type: 'category',
                axisTick: {show: false},
                data: ['0', '1', '2', '3', '4']
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        grid: [
            {top: 100, left: 250}
        ],
        series:seriesArr
    };
    myChart.setOption(option);

    

});

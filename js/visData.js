var dataset = [];
var lineStyle = {
    normal: {
        width: 1,
        opacity: 0.5
    }
};
//var colorArr = ['#F9713C', '#B3E4A1', 'rgb(238, 197, 102)'];
// based on prepared DOM, initialize echarts instance
var myChart = echarts.init(document.getElementById('main'));

d3.json("data/data2.json",function(thisD){
    dataset = thisD;
//    console.log(dataset);
    var allCountries = dataset[0].map(function(dd,i){
        return [i,dd[2]]
    }).slice(0,20);
    var allCountriesName = dataset[0].map(function(dd){
        return dd[2]
    }).slice(0,20);
//    console.log(allCountries);
    
    var all5CateObj = {};
    
    var seriesData = allCountries.map(function(d,i){
//        console.log(d,i*5,(256-i*5));
        
        var thisCountryData = dataset.map(function(d){
            return d[i];
        });
        
        
        
        thisCountryData.forEach(function(d,i){
//            console.log(d[4][1]);
            if(!(d[3][0] in all5CateObj)){
                all5CateObj[d[3][0]] = [];
            }
//            console.log(+d[4][1]);
            if (isNaN(+d[4][1])) {
                all5CateObj[d[3][0]].push(0);
            }
            else{
                all5CateObj[d[3][0]].push(+d[4][1]);
            }
            
        });
        
//        console.log(Object.keys(all5CateObj));
        
        var dataToShowArr = [];
        for (var j = 0; j < 20; j++) {
          var readyArr = [];
          Object.keys(all5CateObj).forEach(function(name){
              if(all5CateObj[name][j]){
                  readyArr.push(all5CateObj[name][j])
              }
              else{
                  readyArr.push(0)
              }
          });
          dataToShowArr.push(readyArr);
        }
//        console.log(dataToShowArr);
        var item = {
                name: d[1],
                type: 'radar',
                lineStyle: lineStyle,
                data: dataToShowArr,
                symbol: 'none',
                itemStyle: {
                    color: "rgb(256, 197, "+Math.round(256*Math.random())+")"
                },
                areaStyle: {
                    opacity: 0.1
                }
        };
        return item
    })
//    console.log(seriesData);

    var indicatorObj = Object.keys(all5CateObj).map(function(d){
        return {name: d, max: 5}
    });

    console.log(indicatorObj);
    
    option = {
        backgroundColor: '#161627',
        title: {
            text: '依國別-五構面雷達圖',
            left: 'center',
            textStyle: {
                color: '#eee'
            }
        },
        legend: {
            bottom: 5,
            data: allCountriesName,
            itemGap: 20,
            textStyle: {
                color: '#fff',
                fontSize: 14
            },
            selectedMode: 'single'
        },
        // visualMap: {
        //     show: true,
        //     min: 0,
        //     max: 20,
        //     dimension: 6,
        //     inRange: {
        //         colorLightness: [0.5, 0.8]
        //     }
        // },
        radar: {
            indicator: indicatorObj,
            shape: 'circle',
            splitNumber: 5,
            name: {
                textStyle: {
                    color: 'rgb(238, 197, 102)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: [
                        'rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)',
                        'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)',
                        'rgba(238, 197, 102, 0.8)', 'rgba(238, 197, 102, 1)'
                    ].reverse()
                }
            },
            splitArea: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(238, 197, 102, 0.5)'
                }
            }
        },
        series: seriesData
    };



    
    console.log(seriesData, option);
//    d3.select('#btns')
//        .selectAll('input')
//        .data(allCountries)
//        .enter()
//        .append('input')
//        .attr({
//            type: "button",
//            value: function(cname){ return cname},
//            onclick: function(cname,i){ return "changeCountry('"+cname+"','"+i+"')"}
//        });
    // use configuration item and data specified to show chart
    myChart.setOption(option);
    d3.select(".lds-roller").remove();
    
});

function changeCountry(c,idx){
    console.log(c,idx);
    var thisCountryData = dataset.map(function(d){
        return d[idx];
    });
    console.log(thisCountryData);
}
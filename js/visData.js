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
d3.csv("data/data6.csv", function(newDataset){

    dataset = newDataset;
    
    var nestData =  d3.nest()
          .key(function(d) { return d.question; })
          .entries(newDataset);
    
    
    var allCountries = nestData[0].values.map(function(dd,i){
        return [i,dd["country"]]
    });
//    console.log(nestData);
    
    var allCountriesName = nestData[0].values.map(function(dd){
        return dd["country"]
    });
    var selectedDict = {};
    
//    console.log(allCountries);
    
    var seriesData = allCountries.map(function(cd,i){
//        console.log(d,i*5,(256-i*5));
        selectedDict[cd[1]] = false;
        var thisCountryData = d3.nest()
          .key(function(d) { return d["country"]; })
          .entries(newDataset)[i].values;
        
//        console.log(thisCountryData);
        
        var all5CateObj = {};
        
        thisCountryData.forEach(function(d,i){
            
            if(!(d["facets"] in all5CateObj)){
                all5CateObj[d["facets"]] = [];
            }
//            console.log(+d[4][1]);
            if (isNaN(+d["score"])) {
//                console.log(d["score"]);
                all5CateObj[d["facets"]].push(0);
            }
            else{
                all5CateObj[d["facets"]].push(+d["score"]);
            }
            
        });
        
//        console.log(Object.keys(all5CateObj));
        
//        console.log(all5CateObj);
        
        var dataToShowArr = [];
        var readyArr = [];
        Object.keys(all5CateObj).forEach(function(name){
            var sum = all5CateObj[name].reduce((previous, current) => current += previous);
            var avg = (sum / all5CateObj[name].length).toFixed(3);
            readyArr.push(avg);
        });
        
        dataToShowArr.push(readyArr);
        
//        var dataToShowArr = [];
//        for (var j = 0; j < 20; j++) {
//          var readyArr = [];
//          Object.keys(all5CateObj).forEach(function(name){
//              if(all5CateObj[name][j]){
//                  readyArr.push(all5CateObj[name][j])
//              }
//              else{
//                  readyArr.push(0)
//              }
//          });
//          dataToShowArr.push(readyArr);
//        }
//        console.log(dataToShowArr);
        var rColor = Math.round(150*i/allCountriesName.length);
//        console.log(rColor);
        
        var item = {
                name: cd[1],
                type: 'radar',
                lineStyle: lineStyle,
                data: dataToShowArr,
                symbol: 'none',
                itemStyle: {
                    color: "rgb(250, "+(220-rColor)+", "+(100+rColor)+")",
                    
                },
                areaStyle: {
                    opacity: 0.3
                }
        };
        return item
    });
//    console.log(seriesData);

    var indicatorObj = fiveCate.map(function(d){
        return {name: d, max: 4}
    });

    selectedDict["Taiwan"] = true;
//    console.log(indicatorObj);
    
    var option = {
        backgroundColor: '#f3f3f3',
        title: {
            top: 10,
            text: '依國別-五構面雷達圖',
            left: 'center',
            textStyle: {
                color: '#222'
            }
        },
        tooltip: {},
        legend: {
            type: "scroll",
            left: 40,
            top: 40,
            bottom: 20,
            width: '50%',
            orient :'vertical',
            pageButtonGap: 25,
            pageButtonItemGap: 30,
            data: allCountriesName,
            inactiveColor: '#aaa',
            itemGap: 12,
//            padding: 1,
//            selected: "false",
            textStyle: {
                color: '#2c343c',
                fontSize: 16
            },
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
            selectorButtonGap: 15,
            selected: selectedDict,
//            selectedMode: 'single',
            selectedMode: 'multiple'
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
            shape: 'polygon',
            splitNumber: 5,
            center: ['50%', '53%'],
            name: {
                textStyle: {
                    color: '#333',
                    fontSize: 14
                }
            },
            splitLine: {
                lineStyle: {
                    width: 2,
                    color: [
                        'rgba(157, 206, 182, 0.1)', 'rgba(157, 206, 182, 0.2)',
                        'rgba(157, 206, 182, 0.4)', 'rgba(157, 206, 182, 0.8)',
                        'rgba(157, 206, 182, 0.9)', 'rgba(157, 206, 182, 1)'
                    ].reverse()
                }
            },
            splitArea: {
                show: true,
                areaStyle:{
                    color: ['#fff','rgba(157, 206, 182, 0.5)'],
                    opacity: 0.3
                }
            },
            axisLabel: {
                show : true,
                showMinLabel: false,
                formatter: function (value) {
                    return Math.round(value);
                },
                textStyle: {
                    color: "#ccc"
                }
            },
            axisLine: {
                lineStyle: {
                    width: 3,
                    color: 'rgba(157, 206, 182, 1)',
                    
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
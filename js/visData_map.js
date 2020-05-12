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
var echartMap = echarts.init(document.getElementById('echart_world_map'));
window.onresize = function () {
    echartMap.resize();
}


function rank2Value(rankStr){
    return 20*(5-rankStr.charCodeAt()+65);
}

var allRankObj = {};
d3.json("data/data2.json", function(dataset){
    
    
    var rankData = dataset[0].map(function(d){
        var item = {
            name: d[2],
            value: rank2Value(d[1]),
//            value: d[1],
            rank: d[1]
        }
        if(allRankObj.hasOwnProperty(d[1])){
            allRankObj[d[1]]+=1;
        }
        else{
            allRankObj[d[1]]=1;
        }
//        console.log(d[2]+"\n");
        return item
    });
    
//    console.log(allRankObj);
    
  echartMap.setOption({
    title: {
      text: 'GDAI World Map',
      subtext: '',
      x: 'center',
      y: 'top',
      top: 40
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
//        console.log(params);
        if(params.data){
            return "Country: "+params.name + '<br>Rank : ' + params.data['rank'];
        }
        else{
            return "Country: "+params.name + '<br>No Data.';
        }
      }
    },
    visualMap: {
      type :"piecewise",
      selectedMode : 'multiple',
        itemWidth : 40,
        left: 30,
        bottom: "20%",
         itemGap: 15,
         padding : 20,
        backgroundColor : 'rgba(238, 238, 238, 0.6)',
      pieces: [
        {gt: 90 , lt: 110, label: "A - "+allRankObj["A"], color: '#2c7bb6'},
        {gt: 70, lt: 90, label: "B - "+allRankObj["B"], color: '#00ccbc'},
        {gt: 50, lt: 70, label: "C - "+allRankObj["C"], color: '#90eb9d'},
        {gt: 30, lt: 50, label: "D - "+allRankObj["D"], color: '#f29e2e'},
        {gt: 10, lt: 30, label: "E - "+allRankObj["E"], color: '#e76818'},
        {lt: 10, label: "F - 0", color: '#d7191c'}
    ],
//      categories:["A","B","C","D","E","F","None"],
//      realtime: false,
//      calculable: true,
//      color: ['#087E65', '#26B99A', '#CBEAE3']
    },
    series: [{
      name: 'GDAI',
      type: 'map',
      mapType: 'world',
      roam: false,
      mapLocation: {
        y: 60
      },
      itemStyle: {
        emphasis: {
          label: {
            show: true
          }
        }
      },
      data: rankData
    }]
  });

});
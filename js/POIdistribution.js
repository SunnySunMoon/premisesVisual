$("#overallList").click(function(){
    viewPremiseList();
});


$("#overallGraph").click(function(){
    viewPremisesOverall();
});

$("#poiDistribution").click(function(){
    viewPOIdistribution();
})

var premisesAllSeriesConfig = {
    name: 'premisesAll',
    type: 'scatter',
    coordinateSystem: 'bmap',
    zlevel:3,
    data: paramData,
    label: {
        normal: {
            formatter: '{b}',
            position: 'right',
            show: false
        },
        emphasis: {
            show: false
        }
    },
    itemStyle: {
        normal: {
            color: 'purple',
            opacity: 0.5
        }
    },
    symbolSize: function (val) {
        return (val[2]-2.9) * 20;
    },
}

function viewPOIdistribution(){
    $(".page-header").html("POI分布");
    $("#contentBox").empty();
    let buttonBox = $("<div id='buttonBox'></div>");
    buttonBox.appendTo("#contentBox");
    
    function addButton(id,name,parent){
        let a = $("<button id='"+id+"' class='poiButton btn'>"+name+"</button>");
        a.appendTo("#"+parent);
    }
    addButton('hospital','医疗','buttonBox');
    addButton('landscape','景点','buttonBox');
    addButton('entertaiment','娱乐','buttonBox');
    addButton('food','饮食','buttonBox');
    addButton('shop','商店','buttonBox');

    let a = $("<div id='main' style='width:1200px; height:600px;'></div>");
    a.appendTo("#contentBox");
    //初始化地图
    let myChart = echarts.init(document.getElementById('main'));
    option = {
        title: {
            text: 'G市楼盘概览 - 百度地图',
            subtext: '大小按评分高低分布',
            left: 'center'
        },
        bmap: {
            center: [106.69, 26.60],
            zoom: 12,
            roam: true,
            mapStyle: {
                styleJson: mapConfig
            }
        },
        tooltip : {
            trigger: 'item',
            formatter: function(res){
                return "<div style='border-bottom: 1px solid rgba(255,255,255,0.3);"
                    + "font-size: 18px; padding-bottom: 7px; margin-bottom: 7px'>"
                    + res.name + "</div>"
                    + res.value[3] + '</br>'
                    + "特色: " + res.value[4] + "</br>"
                    + "均价: " + res.value[5] + "元/平米</br>"
                    + "评分: " + res.value[2] 
                },
        },
    };
    myChart.setOption(option);

    $(function(){
        $("#entertaiment").click(function(){
            makeHeatmap('娱乐场所',cityEntertaiment);
        });
        $("#food").click(function(){
            makeHeatmap('饮食',cityFood);
        });
        $("#hospital").click(function(){
            makeHeatmap('医疗场所',cityHospital);
        });
        $("#landscape").click(function(){
            makeHeatmap('旅游景点',cityLandscape);
        });
        $("#shop").click(function(){
            makeHeatmap("购物商店",cityShop);
        });
    });

    function processArray(splitBaseNumber,arr){
        let squaresArr = [];
        let minlat = 90, maxlat = 0, minlon = 180, maxlon = 0;
        for(let i=0; i<arr.length; i++){
            if(minlat > Number(arr[i].lat)){
                minlat = Number(arr[i].lat);
            }
            if(maxlat < Number(arr[i].lat)){
                maxlat = Number(arr[i].lat);
            }
            if(minlon > Number(arr[i].lon)){
                minlon = Number(arr[i].lon);
            }
            if(maxlon < Number(arr[i].lon)){
                maxlon = Number(arr[i].lon);
            }
        }
        console.log(maxlat,maxlon,"   ", minlat,minlon);
        let latStep = Number(((maxlat - minlat)/splitBaseNumber).toFixed(6));
        let lonStep = Number(((maxlon - minlon)/(2*splitBaseNumber)).toFixed(6));
        for(let i=0; i<splitBaseNumber+1; i++){
            let squarelat = maxlat - i*latStep;
            for(let j=0; j<(2*splitBaseNumber+1); j++){
                let squarelon = minlon + j*lonStep;
                let square = {
                    lat: squarelat,
                    lon: squarelon,
                    endlat: squarelat - latStep,
                    endlon: squarelon + lonStep,
                    num: 0,
                    data:[]
                }
                for(let l=0; l<arr.length; l++){
                    let lat = Number(arr[l].lat);
                    let lon = Number(arr[l].lon);
                    if((lat<=Number(square.lat))&&(lat>=Number(square.endlat))&&(lon>=Number(square.lon))&&(lon<=Number(square.endlon))){
                        square.num ++;
                        square.data.push(arr.splice(l,1));
                        l--
                    }
                    if(Number(square.endlat)>lat){
                        break;
                    }
                }
                if(square.num !== 0){
                   // delete square.endlat;
                   // delete square.endlon;
                    square.lat = Number(square.lat.toFixed(6));
                    square.lon = Number(square.lon.toFixed(6));
                    let a = [square.lon,square.lat,square.num];
                    squaresArr.push(a);
                }
            }
        }
        console.log(squaresArr);
        return squaresArr;
    }
    
    function makeHeatmap(title,arr){
        myChart.showLoading();
        let array0 = []
        for(let i=0;i<arr.length;i++){
            array0.push({
                lat: arr[i].lat,
                lon: arr[i].lon
            });
        }
        let squaresArr = processArray(100,array0);
        myChart.setOption({
            title: {
                text: 'G市'+ title +'POI热力图',
                left: 'center'
            },
            visualMap:{
                type: 'piecewise',
                seriesIndex: 0,
                pieces:[
                    {
                        max: 400,
                        min: 100,
                        color: 'red'
                    },
                    {
                        min: 50,
                        max: 99,
                        color: 'yellow'
                    },
                    {
                        min: 20,
                        max: 49,
                        color: 'green'
                    },
                    {
                        min: 5,
                        max: 19,
                        color: 'blue'
                    },
                    {
                        max: 4,
                        min: 0,
                        color: 'blue'
                    }
                ],
                inRange: {
                    color:['blue','blue','green','yellow','red']
                }
                
            },
            series:[{
                name: 'entertaimentPOI',
                type: 'heatmap',
                coordinateSystem: 'bmap',
                data: squaresArr,
            },
                premisesAllSeriesConfig,
            ]
        });
        myChart.hideLoading();
        console.log(myChart);
    }
}


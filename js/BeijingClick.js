/* 北京点击量分布
 * Clicks' distribution which come from Beijing
*/

//预处理数据部分
{
    //数组去重，获取所有楼盘当月的总点击量
    function getMonthClick(raw){
        let a = [];
        let propArr1 = [];
        let propArr2 = [];
        for(let i=0; i<raw.length; i++){
            propArr1[i] = raw[i].name;
            let b = propArr2.indexOf(propArr1[i]); 
            if(b === -1){
                propArr2.push(raw[i].name);
                a.push({
                    name: raw[i].name,
                    value: parseInt(raw[i].cityB)
                });
            }else{
                a[b].value += parseInt(raw[i].cityB);
            }
        }
        return a;
    }
    //按属性值对数组进行排序
    function objSort(arr,prop){
        for(let i=0; i<arr.length; i++){
            let temp = false;
            for(let j=0; j<arr.length; j++){
                if(arr[i][prop] < arr[j][prop]){
                    objectSwap(arr[i],arr[j]);
                }
            }
        }
    }
    //对象交换函数,针对无嵌套属性对象
    function objectSwap(a,b){
        let temp = {};
        for(x in a ){
            temp[x] = a[x];
            a[x] = b[x];
            b[x] = temp[x];
        }
    }
    //截留TopN 函数
    function remainTop(arr,num){
        if(typeof num === 'number'){
            while(arr.length > num){
                arr.pop();
            }
        }
    }

    var monthClick = getMonthClick(clickData);
    objSort(monthClick,'value');
    monthClick.reverse();
    remainTop(monthClick,20);

    var xhr = new XMLHttpRequest();
    xhr.responseType = "json"
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if((xhr.status >= 200 && xhr.status < 300) || xhr.status ==304){
                let pieData = processData(monthClick,xhr.response);
                drawCharts(monthClick,pieData);
            }else{
                console.log("Request was unsuccessful: " + xhr.status);
            }
        }
    }
    xhr.open("get","../data/premisesAll.js",true);
    xhr.send(null);

    //ajax取得数据后的操作
    function processData(top,all){
        let a = [],b = [];
        for(let i=0; i<top.length; i++){
            for(let j=0; j<all.length; j++){
                if(top[i].name === all[j].名称){
                    a.push({
                        name: all[j].名称,
                        value: parseInt(all[j].均价),
                    });
                    b.push({
                        name: all[j].名称,
                        value: all[j].项目特色
                    });
                    break;
                }
            }
        }
        objSort(a,'value');
        let gap = (a[a.length-1].value - a[0].value)/8;
        let averageData = [];
        let base = a[0].value;
        for(let i=0; i<8; i++){
            let name = base + ' - ' + (base + gap) + '元';
            averageData.push({
                name: name,
                value: 0
            })
            for(let j=0; j<a.length; j++){
                if(a[j].value > base-1 && (a[j].value <= base+gap)){
                    averageData[i].value++ ;
                } 
            }
            base = base + gap;
        }
        
        //处理楼盘特色
        let typeData = [];
        let prop1 = []; 
        for(let i=0; i<b.length; i++){
            let str = prop1.indexOf(b[i].value)
            if(str === -1){
                prop1.push(b[i].value)
                typeData.push({
                    name: b[i].value,
                    value: 1
                });
            }else{
                typeData[str].value++;
            }
        }
        
        let pieData = [averageData,typeData];
        console.log(pieData);
        return pieData;
    }
}

//绘图部分
{
    function drawCharts(monthClick,pieData){
        var myChart = echarts.init(document.getElementById('myCanvas'));
        var option = {
            dataset:{
                dimensions: ['name','value'],
                source: monthClick.reverse()
            },
            xAxis: {},
            yAxis: {type: 'category'},
            tooltip: {
                trigger: 'item'
            },
            series: [
                {
                    name: '点击量Top20楼盘',
                    type: 'bar',
                    encode: {
                        x: 'value',
                        y: 'name'
                    },
                    label:{
						normal:{
							show:true,
							position:'right'
					    }
                    },
                },
                {
                    name: 'Top20楼盘均价分布',
                    type: 'pie',
                    radius: 80,
                    zlevel: 2,
                    center: ['45%', '60%'],
                    data: pieData[0],
                    tooltip: {
                        formatter:'{a}<br/>{b} : {c}'+' 处 ({d}%)'
                    }
                },
                {
                    name: 'Top20楼盘特色分布',
                    type: 'pie',
                    radius: 80,
                    zlevel: 2,
                    center: ['75%', '60%'],
                    data: pieData[1],
                    tooltip: {
                        formatter:'{a}<br/>{b} : {c}'+' 处 ({d}%)'
                    }
                },
            ]
        };
        myChart.setOption(option);
    }
}

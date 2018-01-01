

//保存所有楼盘的名称
var premiseName = [];
for(let i=0; i<dataStatistics.length; i++){
    if(dataStatistics[i].date === "20170301"){
        let a = makePy(dataStatistics[i].name);
        premiseName.push({
            name:dataStatistics[i].name,
            alpha: a
        });
    }else{
        break;
    }
}

//返回值:拼音首字母串数组  
function makePy(str) {
    var arrResult = new Array(); //保存中间结果的数组  
    for(let i=0; i<str.length; i++){
        //获得unicode码  
        var charUnicode = str.charCodeAt(i);
        //检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理  
        if(charUnicode > 40869 || charUnicode < 19968){
            //do nothing
        }
        arrResult.push(strChineseFirstPY.charAt(charUnicode - 19968));
    }
    //处理arrResult,返回所有可能的拼音首字母串数组  
    return arrResult.join("");
}

//按首字母从小到大排序楼盘名称数组
for(let i=0; i<premiseName.length; i++){
    for(let j=i+1; j<premiseName.length; j++){
        if(premiseName[i].alpha > premiseName[j].alpha){
            objectSwap(premiseName[i],premiseName[j]);
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

//填充楼盘下拉列表
var pDropdown = document.getElementById("pMenu");
var flag = ""
for(let i=0; i<premiseName.length; i++){
    if(flag !== premiseName[i].alpha.charAt(0)){
        let a = document.createElement("li");
        let b = document.createTextNode(premiseName[i].alpha.charAt(0));
        let c = document.createElement("hr");
        pDropdown.appendChild(a);
        pDropdown.appendChild(c);
        a.appendChild(b);
        a.setAttribute("class","initChar");
        flag = premiseName[i].alpha.charAt(0);
    }
    let a = document.createElement("li");
    let b = document.createTextNode(premiseName[i].name);
    pDropdown.appendChild(a);
    a.appendChild(b);
    a.setAttribute("class","nameCard");
}

//楼盘名称绑定点击事件
var liName = document.getElementsByClassName('nameCard');
Array.prototype.forEach.call(liName,function(element){
    element.addEventListener('click',function(){
        drawFoldLine(this.textContent);  //调用绘制折线图函数
    });
});

//绘制折线图函数
function drawFoldLine(namePara){
    let date = [], dayActive = [] , dayC = [], resident = [], inflow = [];
    for(let i=0; i<dataStatistics.length; i++){
        if(dataStatistics[i].name === namePara){
            let str = dataStatistics[i].date;
            date.push(str.substring(0,4) + '年' + str.substring(4,6) + '月' + str.substring(6) + '日');
            dayActive.push(dataStatistics[i].dayActive);
            dayC.push(dataStatistics[i].dayC);
            resident.push(dataStatistics[i].resident);
            inflow.push(dataStatistics[i].inflow);
        }
    }
    let dataObject = {
        date: date,
        dayA: dayActive,
        dayC: dayC,
        resident: resident,
        inflow: inflow
    };
    
    var foldLine = echarts.init(document.getElementById("foldLine"));
    var option = {
        title:{
            text: namePara + "居民统计",
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['dayA人数','dayC人数','居民人数','日流入人数']
        },
        xAxis: {
            type: 'category',
            houndaryGap: false,
            data: dataObject.date
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}人/次'
            }
        },
        series:[
            {
                name: 'dayA人数',
                type: 'line',
                data: dataObject.dayA
            },
            {
                name: 'dayC人数',
                type: 'line',
                data: dataObject.dayC
            },
            {
                name: '居民人数',
                type: 'line',
                data: dataObject.resident
            },
            {
                name: '日流入人数',
                type: 'line',
                data: dataObject.inflow
            }
        ]
    };
    foldLine.setOption(option);
};

//保存所有日期
var dateArr = [];
for(let i=0; i<dataStatistics.length; i++){
    if(i == 0){
        dateArr.push(dataStatistics[i].date);
    }else if(dateArr[i-1] !== dataStatistics[i].date){
        dateArr.push(dataStatistics[i].date);
    }
}
//设定时间控件上下限
var selectDate = document.getElementById("selectD");
selectDate.addEventListener('click',function(){
    let a = dateArr[0], b = dateArr[dateArr.length - 1];
    let minDate = a.substring(0,4) + '-' + a.substring(4,6) + '-' + a.substring(6);
    let maxDate = b.substring(0,4) + '-' + b.substring(4,6) + '-' + b.substring(6);
    //修改html5原生时间控件的上下限
    let c = document.getElementById("dateSelection");
    c.value = minDate;
    c.min = minDate;
    c.max = maxDate;
});

//保存提交的日期
var submitedDateDom = document.getElementById("submitDate");
var submitedDate = null, dataType = null; //要提交的日期和数据类型
submitedDateDom.addEventListener('click',function(){
    submitedDate = document.getElementById("dateSelection").value;
    drawBar(submitedDate,dataType);
});

//保存提交的数据类型
var btnArr = document.getElementsByClassName("btn-default");
[].forEach.call(btnArr,function(element){
    element.addEventListener('click',function(){
        dataType = element.id;
        drawBar(submitedDate,dataType);
    });
});

//准备Top10数据
function getTopData(date,type){
    let premise = [];
    for(let i=0; i<dataStatistics.length; i++){
        if(dataStatistics[i].date === date){
            premise.push({
                name: dataStatistics[i].name,
                data: parseInt(dataStatistics[i][type])
            });
        }
    }
    for(let i=0; i<premise.length; i++){
        for(let j=i+1; j<premise.length; j++){
            if(premise[i].data < premise[j].data){
                objectSwap(premise[i],premise[j]);
            }
        }
    }
    return premise.splice(0,10);
}

//绘制条形图函数
function drawBar(date,dataType){
    if(date === null || dataType === null){
        return; //若未选择日期或数据类型则直接返回
    }
    let barDate = date.substring(0,4) + date.substring(5,7) + date.substring(8);
    let barData = getTopData(barDate,dataType);
    console.log(barData);
    let topPreNames = [];
    for(let i=0; i<barData.length; i++){
        topPreNames[i] = barData[i].name;
        barData[i] = barData[i].data;
    }
    let dataTypeStr = null;
    switch (dataType){
        case "resident":
            dataTypeStr = "居民人数"; break;
        case "dayActive":
            dataTypeStr = "日活跃人数"; break;
        case "dayC":
            dataTypeStr = "日C数据"; break;
        case "inflow":
            dataTypeStr = "流入人数"; break;
    }

    let bar = echarts.init(document.getElementById("bar"));
    let option = {
        title: {
            text: date + dataTypeStr + "Top10楼盘"
        },
        tooltip: {
            trigger: 'axis',
            axisPointer:{
                type: 'shadow'
            }
        },
        legend:{
            data: [dataTypeStr]
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}人'
            }
        },
        yAxis: {
            type: 'category',
            data: topPreNames.reverse()
        },
        series: [
            {
                name: dataTypeStr,
                type: 'bar',
                data: barData.reverse(),
                label: {
                    normal:{
                        show: true
                    }
                }
            }
        ]
    };
    bar.setOption(option);
}
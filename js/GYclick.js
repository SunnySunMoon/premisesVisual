/*贵阳市点击统计页面js代码*/


//楼盘下拉框模块
{
    //保存所有楼盘名称
    var premiseName = [];
    for(let i=0; i<clickData.length; i++){
        if(clickData[i].date === "20170301"){
            let a = makePy(clickData[i].name);
            premiseName.push({
                name: clickData[i].name,
                alpha: a
            });
        }else{
            break;
        }
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
    // 填充楼盘下拉列表
    var pDropdown = document.getElementById("pMenu");
    var flag = "";
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

    //楼盘名菜单点击事件
    var liName = document.getElementsByClassName("nameCard");
    Array.prototype.forEach.call(liName,function(element){
        element.addEventListener('click',function(){
            console.log(this.textContent);
            drawFoldLine(this.textContent);
        });
    });
}

//时间选择模块
{
    //保存所有日期
    var dateArr = [];
    for(let i=0; i<clickData.length; i++){
        if(i === 0){
            dateArr.push(clickData[i].date);
        }else if(dateArr[i-1] !== clickData[i].date){
            dateArr.push(clickData[i].date);
        }
    }
    //设定时间控件上下限
    var selectDate = document.getElementById('selectD');
    selectDate.addEventListener('click',function(){
        let a = dateArr[0], b = dateArr[dateArr.length-1];
        let minDate = a.substring(0,4) + '-' + a.substring(4,6) + '-' + a.substring(6);
        let maxDate = b.substring(0,4) + '-' + b.substring(4,6) + '-' + b.substring(6);
        //修改html5原生时间控件的上下限
        let c = document.getElementById("dateSelection");
        c.value = minDate;
        c.min = minDate;
        c.max = maxDate; 
    });
    //保存提交日期，触发绘制条形图函数
    var submitedDateDom = document.getElementById('submitDate');
    var submitDate = null;
    submitedDateDom.addEventListener('click',function(){
        submitDate = document.getElementById('dateSelection').value;
        let a = submitDate.substring(0,4)+submitDate.substring(5,7)+submitDate.substring(8);
        console.log(a);
        drawBar(a);
    });
    //准备Top10数据
    function getTopData(date){
        let premise = [];
        for(let i=0; i<clickData.length; i++){
            if(date == clickData[i].date){
                premise.push({
                    name: clickData[i].name,
                    clickNum: parseInt(clickData[i].cityG)
                });
            }
        }
        for(let i=0; i<premise.length; i++){
            for(let j=i+1; j<premise.length; j++){
                if(premise[i].clickNum < premise[j].clickNum){
                    objectSwap(premise[i],premise[j]);
                }
            }
        }
        return premise.splice(0,10);
    }
}

//绘图模块
{
    //绘制折线图
    function drawFoldLine(name){
        let cityG = [], cityB = [],date = [];
        let cityGAll = 0, cityBAll = 0;
        for(let i=0; i<clickData.length; i++){
            if(clickData[i].name === name){
                cityG.push(clickData[i].cityG);
                cityB.push(clickData[i].cityB);
                cityBAll += parseInt(clickData[i].cityB);
                cityGAll += parseInt(clickData[i].cityG);
                let str = clickData[i].date;
                date.push(str.substring(0,4) + '年' + str.substring(4,6) + '月' + str.substring(6) + '日')
            }
        }

        let foldLine = echarts.init(document.getElementById("foldLine"));
        let option = {
            title: {
                text: name + "点击统计"
            },
            tooltip: {
                trigger: 'axis',
            },
            grid: {
                top: 80,
                bottom: 100,
                tooltip: {
                    trigger: 'axis'
                }
            },
            legend: {
                data: ['贵阳市点击','北京市点击','总访问量占比']
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: date
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value}次'
                }
            },
            series: [
                {
                    name: '贵阳市点击',
                    type: 'line',
                    data: cityG
                },
                {
                    name: '北京市点击',
                    type: 'line',
                    data: cityB
                },
                {
                    name: '总访问量占比',
                    type: 'pie',
                    zlevel: 2,
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    data: [
                        {
                            name: '北京',
                            value: cityBAll,
                        },
                        {
                            name: '贵阳',
                            value: cityGAll
                        }
                    ],
                    radius: [0,50],
                    center: ['90%','20%']
                }
            ]
        };
        foldLine.setOption(option);
    }

    //绘制条形图
    function drawBar(date){
        let barData = getTopData(date);
        console.log(barData);
        date = date.substring(0,4) + '年' + date.substring(4,6) + '月' + date.substring(6) + '日'
        let topPreNames = [];
        for(let i=0; i<barData.length; i++){
            topPreNames.push(barData[i].name);
            barData[i] = barData[i].clickNum;
        }
        console.log(barData);
        let bar = echarts.init(document.getElementById('bar'));
        let option = {
            title: {
                text: date + "点击量Top10楼盘"
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['贵阳市点击量']
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} 次' 
                }
            },
            yAxis: {
                type: 'category',
                data: topPreNames.reverse(),
            },
            series: [
                {
                    name: '贵阳市点击量',
                    type: 'bar',
                    data: barData.reverse(),
                    label: {
                        normal: {
                            show: true
                        }
                    }
                }
            ]
        };
        bar.setOption(option);
    }
}


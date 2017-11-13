$("#overallList").click(function(){
    viewPremiseList();
});


$("#overallGraph").click(function(){
    viewPremisesOverall();
});

function viewPremiseList(){
    $(".page-header").html("楼盘列表");
    $("#contentBox").empty();
    
    let listMessage = [];
    for(let i=0; i<premisesAll.length; i++){
        listMessage.push({
            name: premisesAll[i].name,
            address: premisesAll[i].address,
            averagePrice: premisesAll[i].averagePrice,
            areaCovered: premisesAll[i].areaCovered,
            grade: premisesAll[i].grade
        });
    }
    
    let a = $("<table id='list' class='table  table-no-bordered"
    +"data-show-toggle='true'><thead><tr>"
    +"<th data-field='name'>名称</th>"
    +"<th data-field='address'>地址</th>"
    +"<th data-field='averagePrice'>均价(元/平米)</th>"
    +"<th data-field='areaCovered'>占地面积(平方米)</th>"
    +"<th data-field='grade'>评分</th>"
    +"</tr></thead></table>");
    a.appendTo("#contentBox");
    $("#list").bootstrapTable({
        data: listMessage,
        pagination: true,
        pageNumber: 1,
        pageSize: 12,
        search: true,
        searchAlign: 'left',
        buttonsAlign: 'left',
        toolbar: '#toolbar'
    });
}




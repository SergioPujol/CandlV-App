console.log('Charts js')

var chart;
var interval = null;

document.getElementById('start').onclick = () => {
    console.log('start')
    if(!interval) {
        func()
        interval = setInterval(func, 1 * 60 * 1000)
    }
}

document.getElementById('stop').onclick = () => {
    console.log('stop')
    if(interval) {
        clearInterval(interval)
        interval = null
    }
}

function func () {
    fetch('http://localhost:3000/getEMAsData')
    .then(response => response.json())
    .then(data => {
        if(data) setOptions(data)
    });
}


require(['echarts'], (echarts) => {
    chart = echarts.init(document.getElementById('chart'));
    chart.setOption({
        xAxis: {
            type: 'time',
        },
        yAxis: {
            type: 'value'
        },
        legend: {
            show: true
        },
        tooltip: {
            show: true
        },
        dataZoom: [
            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'none'
            }
        ],
        series: []
    });
});

function setOptions(data) {
    chart.setOption({
        series: [
            {
                name: 'Period 3',
                data: data[0],
                type: 'line',
                showSymbol: false,
                smooth: true
            },
            {
                name: 'Period 6',
                data: data[1],
                type: 'line',
                showSymbol: false,
                smooth: true
            }
        ]
    })
}
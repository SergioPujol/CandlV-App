console.log('Charts js')

var chart;
var interval = null;

document.getElementById('start').onclick = () => {
    console.log('start')
    if(!interval) {
        func()
        interval = setInterval(func, 0.5 * 60 * 1000)
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
    fetch('http://localhost:3000/getChartData')
    .then(response => response.json())
    .then(data => {
        if(data) setOptions(data)
    });
}


require(['echarts'], (echarts) => {
    chart = echarts.init(document.getElementById('chart'));
    chart.setOption({
        xAxis: {
            type: 'category',//'time',
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax'
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true
            }
        },
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 10,
                end: 100
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'slider',
                bottom: 10,
                start: 10,
                end: 100
            }
        ],
        legend: {
            show: true
        },
        tooltip: {
            trigger: 'axis'
        },
        series: []
    });
});

function setOptions(data) {
    console.log(data)
    const { EMAData, CandlesData } = data
    const series = EMAData.map(ema => {
        return {
            name: `Period ${ema.n}`,
            data: ema.listData,
            type: 'line',
            showSymbol: false,
            smooth: true
        }
    });
    series.push({
        name: `BTCUSDT Candles`,
        data: CandlesData.values,
        type: 'candlestick',
    })
    chart.setOption({
        xAxis : {data: CandlesData.categoryData},
        series: series
    })

    console.log(chart.getOption())
}

window.addEventListener('resize',function(){
    chart.resize();
})
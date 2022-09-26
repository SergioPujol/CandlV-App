//new Date(document.getElementById('from-time').value).getTime();

import Datafeed from '../TradingView/datafeed.js';

document.getElementById('add-chart-simulation').onclick = generateChart

function generateChart() {

    const timeframe = Math.ceil((new Date(document.getElementById('to-time').value).getTime()/1000 - new Date(document.getElementById('from-time').value).getTime()/1000)/3600)
    console.log(timeframe)

    const widget = window.tvWidget = new TradingView.widget({
        symbol: 'ETHUSDT', // default symbol
        interval: '5', // default interval
        timeframe: `${timeframe}H`,
        fullscreen: false, // displays the chart in the fullscreen mode
        container: 'tv_chart_container',
        datafeed: Datafeed,
        autosize: true,
        theme: 'Dark',
        library_path: '../TradingView/charting_library/charting_library/',
    });

    setTimeout(()=>{
        widget.activeChart().createStudy('Moving Average Exponential', false, false, { length: 3 })
        widget.activeChart().createStudy('Moving Average Exponential', false, false, { length: 6 })
    },2000)

}
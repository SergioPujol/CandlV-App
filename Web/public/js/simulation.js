import Datafeed from '../TradingView/datafeed.js';

document.getElementById('add-chart-simulation').onclick = await generateChart

const strategies = {
    '2EMA': {
        ema_short_period: 3, // default value
        ema_long_period: 6 // default value
        // TODO, add more options to 2EMA
    }
}

var botOpts = {}
var simulationOpts = {}

async function generateChart() {

    // check for values before -> if any is null throwError
    if(!document.getElementById('to-time').value || !document.getElementById('from-time').value) {
        showError('Time fields have to be filled')
        return
    }

    if(Object.keys(botOpts).length === 0) {
        showError('Bot options have to be selected')
        return
    }

    simulationOpts = {
        symbol: document.getElementById('add-chart-symbol').value.toUpperCase(), // default symbol
        interval: document.getElementById('add-chart-interval').value, // default interval
        period: {
            to: new Date(document.getElementById('to-time').value).getTime(),
            from: new Date(document.getElementById('from-time').value).getTime()
        }
    }

    //const timeframe = Math.ceil((new Date(document.getElementById('to-time').value).getTime()/1000 - new Date(document.getElementById('from-time').value).getTime()/1000)/3600)

    const widget = window.tvWidget = new TradingView.widget({
        symbol: document.getElementById('add-chart-symbol').value.toUpperCase(), // default symbol
        interval: document.getElementById('add-chart-interval').value, // default interval
        //timeframe: `${timeframe}H`,
        timezone: 'Europe/Madrid',
        fullscreen: false, // displays the chart in the fullscreen mode
        container: 'tv_chart_container',
        datafeed: Datafeed,
        autosize: true,
        theme: 'Dark',
        library_path: '../TradingView/charting_library/charting_library/',
    });


    widget.onChartReady(async () => {
        const from = new Date(document.getElementById('from-time').value).getTime()/1000
        const to = new Date(document.getElementById('to-time').value).getTime()/1000
        widget.activeChart().setVisibleRange({ from, to });
        widget.activeChart().createShape({ time: from }, { shape: 'vertical_line', lock: true });
        addStudies(widget)

        await startSimulation()
    })

}

function addStudies(widget) {
    /**Add studies depending the strategy selected and options for the strategy */
    const {botStrategy, botOptions} = botOpts

    switch(botStrategy) {
        case '2EMA':
    
            Object.keys(botOptions).forEach((opt) => {
                console.log()
                widget.activeChart().createStudy('Moving Average Exponential', false, false, { length: parseInt(botOptions[opt]) })
            })

        break;

        // case '':
    }
}

function loadBotStrategyModal() {

    document.querySelector('#saveBot-button').addEventListener('click', () => saveBotOptionsModal())

}

function loadBotModal() {
    const strategySelect = document.querySelector('#add-bot-modal-simulation .strategies-select')
    appendOptionsToStrategySelect(strategySelect)
    strategySelect.addEventListener('change', updateModalWithStrategy(strategySelect.value));
}

function saveBotOptionsModal() {

    const addBotModalContainer = document.getElementById(`add-bot-modal-simulation`);
    const staticValuesContainer = addBotModalContainer.querySelector('.static-bot-values');
    const optionsContainer = addBotModalContainer.querySelectorAll('.container-strategy-options > div')
    
    let customOptions = {};
    optionsContainer.forEach(optionContainer => {
        customOptions[optionContainer.id] = optionContainer.querySelector('input').value;
    });
    
    const values = {
        strategy: staticValuesContainer.querySelector('select.strategies-select').value,
        custom: customOptions,
        status: true
    }

    botOpts = {
        botId: 'simulation-bot', botStrategy: values.strategy, botOptions: customOptions
    }
    console.log('botOpts',botOpts)

    showSuccess('Saved bot options')
    
}

function appendOptionsToStrategySelect(element) {
    Object.keys(strategies).forEach(strategy => {
        let opt = document.createElement('option');
        opt.value = strategy;
        opt.innerHTML = strategy;
        element.appendChild(opt)
    })
}

function updateModalWithStrategy(strategy) {
    let strategyContainer = document.querySelector(`#add-bot-modal-simulation .container-strategy-options`);
    strategyContainer.innerHTML = ''
    
    const strategyOptions = strategies[strategy]

    Object.keys(strategyOptions).forEach(option => {
        let div = document.createElement('div')
        div.classList.add('d-flex', 'flex-row', 'align-items-center', 'mb-2')
        div.id = option
        div.innerHTML = `
            <span class="col-md-6" value="option">${option.replaceAll('_', ' ')}</span>
            <input class="col-md-6 form-control" type="text" placeholder="Bot name" value="${strategyOptions[option]}"/>`;
        strategyContainer.appendChild(div)
    })
}

function loadingSpinner() {
    if(document.querySelector('.simulation-trades #loading-spinner').classList.contains('visually-hidden')) document.querySelector('.simulation-trades #loading-spinner').classList.remove('visually-hidden')
    else document.querySelector('.simulation-trades #loading-spinner').classList.add('visually-hidden')
}

async function startSimulation() {
    /**
     * Call Server_Process
     * receive list of trades
     * with the list of trades:
     * 1. add points to the chart
     * 2. populate trades containers
     */

    loadingSpinner();
    const { symbol, interval, period } = simulationOpts;
    const { botId, botStrategy, botOptions } = botOpts;

     const result = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bot_id: botId, symbol, interval, period, strategy: botStrategy, botOptions })
    }).then((res) => res.json())

    if(result.status) {
        console.log(result.data)
        loadInvestingPoints(result.data)
        await loadTradeContainers(result.data)
    } else {
        loadingSpinner();
        showError(result.error)
        return false
    }
}

const createStartLongShape = (obj) => {
    let color = '#5e078a'
    window.tvWidget.activeChart().createShape(
        obj,
        {
            shape: "arrow_up",
            lock: true,
            overrides: {
                color: color,
                fontsize: 12
            },
        }
    );
}

const createStartShortShape = (obj) => {
    let color = '#5e078a'
    window.tvWidget.activeChart().createShape(
        obj,
        {
            shape: "arrow_down",
            lock: true,
            overrides: {
                color: color,
                fontsize: 12
            },
        }
    );
}

const createRectangle = (obj, color) => {
    window.tvWidget.activeChart().createMultipointShape(
        obj,
            {
                shape: "rectangle",
                lock: true,
                overrides: {
                    backgroundColor: color,
                    color: color,
                    fillBackground: false
                }, 
            }
        );
}

function loadInvestingPoints(trades) {
    /**
     * load investing points into the TradingView Chart
     */
    let tempTrade;
    trades.forEach(trade => {
        let tempObject = {time: trade.date/1000, price: parseFloat(trade.price)}
        if(trade.type == 'enter') {
            if(trade.decision == 'Buy') createStartLongShape(tempObject)
            //else if(trade.decision == 'Start Short') createStartShortShape(tempObject)
        } else {
            if(trade.decision == 'Sell' && trade.percentage.includes('-')/* || trade.decision == 'Exit Short' && !trade.percentage.includes('-')*/) createRectangle([tempTrade, tempObject], '#bf1515')
            else if(/*trade.decision == 'Exit Short' && trade.percentage.includes('-') || */trade.decision == 'Sell' && !trade.percentage.includes('-')) createRectangle([tempTrade, tempObject], '#2b9915')
        }

        if(trade.date/1000 < new Date(document.getElementById('from-time').value).getTime()/1000) console.log('weird trade data', trade)
        else tempTrade = tempObject
    })
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

async function loadTradeContainers(trades) {
    /**
     * trades is all the trades 
     */

    const tradesContainer = document.querySelector('.trade-container')
    tradesContainer.innerHTML = ""
    for await(let trade of trades) {
        let tradeCont = document.createElement('div')
        var dt = new Date(trade.date)
        var dateFormat = `${padL(dt.getDate())}/${padL(dt.getMonth()+1)}/${dt.getFullYear()} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`

        if(trade.type == 'enter') {
            tradeCont.classList.add('trade', 'trade-decision')
            tradeCont.innerHTML = `
                <div class="trade-icon"><i class="bi bi-graph-${trade.decision == 'Buy' ? 'up' : 'down' }"></i></div>
                <div class="trade-decision">${trade.decision}</div>
                <div class="trade-price">${parseFloat(trade.price).toFixed(2)}</div>
                <div class="trade-percentage">actualPerc%</div>
                <div class="trade-time">${dateFormat}</div>
            `
        } else {
            tradeCont.classList.add('trade', 'trade-close')
            tradeCont.innerHTML = `
                <div class="trade-icon"><i class="bi bi-chevron-${trade.percentage.includes('-') ? 'down' : 'up'}"></i></div>
                <div class="trade-decision">${trade.decision}</div>
                <div class="trade-price">${parseFloat(trade.price).toFixed(2)}</div>
                <div class="trade-percentage">${trade.percentage}</div>
                <div class="trade-time">${dateFormat}</div>
            `
        }
        tradesContainer.append(tradeCont)
        await sleep(50)
    }

    loadingSpinner();
}

(async function () {
    console.log('check login status')
    /*const status = await checkLoginStatus()
    if(!status) location.href = 'home.html'*/
    loadBotModal();
    document.getElementById('open-bot-options').onclick = () => loadBotStrategyModal()
})();
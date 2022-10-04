import Datafeed from '../TradingView/datafeed.js';

document.getElementById('add-chart-simulation').onclick = generateChart

const strategies = {
    '2EMA': {
        ema_short_period: 3, // default value
        ema_long_period: 6 // default value
        // TODO, add more options to 2EMA
    }
}

var botOpts = {}

function generateChart() {

    // check for values before -> if any is null throwError
    if(!document.getElementById('to-time').value || !document.getElementById('from-time').value) {
        showError('Time fields have to be filled')
        return
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


    setTimeout(()=>{
        widget.activeChart().setVisibleRange({
            from: new Date(document.getElementById('from-time').value).getTime()/1000,
            to: new Date(document.getElementById('to-time').value).getTime()/1000
        });
        addStudies(widget)
    },2000)

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

async function startSimulation() {
    /**
     * Call Server_Process
     * receive list of trades
     * with the list of trades:
     * 1. add points to the chart
     * 2. populate trades containers
     */
}

function loadInvestingPoints(trades) {
    /**
     * load investing points into the TradingView Chart
     */
}

function loadTradeContainers(trades) {
    /**
     * trades is all the trades 
     */
}

(async function () {
    console.log('check login status')
    checkLoginStatus();
    loadBotModal();
    document.getElementById('open-bot-options').onclick = () => loadBotStrategyModal()
})();
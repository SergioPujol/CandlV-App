import Datafeed from '../TradingView/datafeed.js';

document.getElementById('add-chart-simulation').onclick = generateChart

const strategies = {
    '2EMA': {
        ema_short_period: 3, // default value
        ema_long_period: 6 // default value
        // TODO, add more options to 2EMA
    }
}

var botOptions = {}

function generateChart() {

    // check for values before -> if any is null throwError

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

    botOptions = {
        botId: 'simulation-bot', botStrategy: values.strategy, botOptions: customOptions
    }
    console.log('botOptions',botOptions)

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

(async function () {
    console.log('check login status')
    checkLoginStatus();
    loadBotModal();
    document.getElementById('open-bot-options').onclick = () => loadBotStrategyModal()
})();
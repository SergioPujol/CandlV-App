function minmaxWindows() {
    document.querySelectorAll('.window').forEach(window => {
        let id = window.id
        document.getElementById(`window-${id}-chart-menu`).querySelector('button').onclick = ()=>{
            if(document.getElementById(`window-${id}-data`).classList.contains('hide-data')) document.getElementById(`window-${id}-data`).classList.remove('hide-data')
            else document.getElementById(`window-${id}-data`).classList.add('hide-data')        
        }
    
        document.getElementById(`window-${id}-chart-options-close`).onclick = async ()=>{
            const response = await deleteChartFromDB(id)
            if(response) {
                window.remove()
                document.getElementById(`window-${id}-minimized`).remove()
            }
        }
    
        document.getElementById(`window-${id}-chart-options-minimize`).onclick = ()=>{
            window.classList.add('minimize-chart')
            document.getElementById(`window-${id}-minimized`).classList.remove('maximized-chart')
        }
    
        document.getElementById(`window-${id}-chart-options-maximize`).onclick = ()=>{
            window.classList.remove('minimize-chart')
            document.getElementById(`window-${id}-minimized`).classList.add('maximized-chart')
        }
    });
}
minmaxWindows()
// MODAL
const strategies = {
    '2EMA': {
        ema_short_period: 3, // default value
        ema_long_period: 6 // default value
        // TODO, add more options to 2EMA
    }
}

function appendOptionsToStrategySelect(element) {
    Object.keys(strategies).forEach(strategy => {
        let opt = document.createElement('option');
        opt.value = strategy;
        opt.innerHTML = strategy;
        element.appendChild(opt)
    })
}

function updateModalWithStrategy(chartId, strategy) {
    console.log(chartId, strategy)
    const strategyContainer = document.querySelector(`#add-bot-modal-${chartId} .container-strategy-options`);
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

document.getElementById('add-chart').querySelector('button').addEventListener('click', async ()=> await createWindow())
async function createWindow() {

    // create chart id
    const chartId = createId()

    // TODO


    // info from select
    const addChartContainer = document.getElementById('add-chart')
    const values = {
        symbol: addChartContainer.querySelector('#add-chart-symbol').value,
        interval: addChartContainer.querySelector('#add-chart-interval').value
    }

    const status = await createChartDB({
        chartId, chartOptions: { symbol: values.symbol, interval: values.interval }, minimized: false
    }, username_gbl)
    console.log('createChartDB', status)
    if(!status) return

    await loadChartIntoHtml(chartId, values)

}

async function loadChartIntoHtml(chartId, values) {
    const { window, minimizedChart, modal } = createHtmlWindow(chartId, values);
    document.querySelector('.charts-information').appendChild(window);
    document.querySelector('.charts-information > .minimized-charts').appendChild(minimizedChart);
    document.querySelector('.charts-information > .modals').appendChild(modal);

    addBotButtonAndModal(chartId)

    minmaxWindows()
    addTradingViewChart(chartId, values)
}

function addTradingViewChart(chartId, valuesChart) {
    const widget = new TradingView.widget(
        {
            "autosize": true,
            "symbol": `BINANCE:${valuesChart.symbol}`,
            "interval": valuesChart.interval,
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "es",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": `tradingview_${chartId}`
        }
    );
    
    /*setTimeout(()=>{
        widget.activeChart().createStudy('Moving Average Exponential', false, false, { length: 3 })
        widget.activeChart().createStudy('Moving Average Exponential', false, false, { length: 6 })
    },2000)*/
}

function createHtmlWindow(chartId, options) {
    const window = document.createElement('div')
    window.id = `${chartId}`
    window.classList.add('window')
    window.innerHTML = `
        <div id="window-${chartId}-chart" class="chart flex-grow-1">
        <div id="window-${chartId}-chart-buttons" class="chart-buttons">
            <div class="chart-options" id="window-${chartId}-chart-options">
                <button type="button" class="btn btn-2" data-bs-toggle="modal" data-bs-target="#modal-${chartId}">
                    <i class="bi bi-x"></i>
                </button>
                <button type="button" class="btn btn-2" id="window-${chartId}-chart-options-minimize">
                    <i class="bi bi-dash"></i>
                </button>
            </div>
            <div class="chart-menu" id="window-${chartId}-chart-menu">
                <button type="button" class="btn btn-2">
                    <i class="bi bi-list"></i>
                </button>
            </div>
        </div>
        
        <!-- TradingView Widget BEGIN -->
        <div class="tradingview-widget-container">
            <div id="tradingview_${chartId}"></div>
            <div class="tradingview-widget-copyright"><a href="https://es.tradingview.com/symbols/BTCUSDT/?exchange=BINANCE" rel="noopener" target="_blank"><span class="blue-text">BTCUSDT Gráfico</span></a> por TradingView</div>
        </div>
        <!-- TradingView Widget END -->
        
        </div>
        <div id="window-${chartId}-data" class="data d-flex flex-column">

        <div class="d-flex flex-column">
            <button class="btn btn-2 mb-2 button-collapse show" type="button" data-bs-toggle="collapse" data-bs-target="#window-${chartId}-data-market" aria-expanded="true" aria-controls="window-${chartId}-data-market">
            <div class="charts-info-button-container">
                <span class="charts-info-button-container-span">Market Settings</span>
                <i class="bi bi-caret-down-fill text-collapsed"></i>
                <i class="bi bi-caret-up-fill text-expanded"></i>
            </div>
            </button>

            <div class="collapse multi-collapse market-settings show" id="window-${chartId}-data-market">
            <div class="d-flex flex-column">
                <div class="d-flex flex-row align-items-center mb-2 symbol-select">
                    <span class="col-md-6">Symbol</span>
                </div>
                <div class="d-flex flex-row align-items-center mb-2 interval-select">
                    <span class="col-md-6">Interval</span>
                </div>
            </div>
            </div>
        </div>
        
        <div class="d-flex flex-column overflow-hidden">
            <button class="btn btn-2 mb-2 button-collapse" type="button" data-bs-toggle="collapse" data-bs-target="#window-${chartId}-data-bot" aria-expanded="false" aria-controls="window-${chartId}-data-bot">
            <div class="charts-info-button-container">
                <span class="charts-info-button-container-span">Bot Settings</span>
                <i class="bi bi-caret-down-fill text-collapsed"></i>
                <i class="bi bi-caret-up-fill text-expanded"></i>
            </div>
            </button>

            <div class="collapse multi-collapse overflow-hidden bot-settings" id="window-${chartId}-data-bot">
                <div class="overflow-auto">
                    <div class="accordion" id="botAccordion-${chartId}">
                    </div>
                </div>
                <button class="btn btn-1 mt-2 add-bot" data-bs-toggle="modal" data-bs-target="#add-bot-modal-${chartId}">Add bot</button>
            </div>
        </div>

        <div class="buy-sell-buttons d-flex flex-row align-items-center mb-2" id="buy-sell-${chartId}-buttons">
            <button class="col-md-6 btn btn-2">BUY</button>
            <button class="col-md-6 btn btn-2">SELL</button>
        </div>
        
        </div>

        <div class="modal fade" id="add-bot-modal-${chartId}" tabindex="-1" aria-labelledby="Modal${chartId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="botModal${chartId}Label">Create bot</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- MODAL BODY FOR THE CREATION OF THE BOT -->
                        <div class="static-bot-values">

                            <!-- container with the name and strategy to select -->
                            <div class="d-flex flex-row align-items-center mb-2">
                                <span class="col-md-6">Name</span>
                                <input class="col-md-6 form-control" type="text" placeholder="Bot name">
                            </div>
                            <div class="d-flex flex-row align-items-center mb-2">
                                <span class="col-md-6">Strategy</span>
                                <select class="col-md-6 form-select strategies-select">
                                <!-- <option value="2EMA" selected>2EMA</option>-->
                                </select>
                            </div>

                        </div>
                        <div class="container-strategy-options d-flex flex-column">
                        <!-- container configurable depending on the strategy -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="addBot-button">Add bot</button>
                    </div>
                </div>
            </div>
        </div>`

    const marketSettings = window.querySelector(`#window-${chartId}-data-market`);

    const symbolSelect = createSelectSymbol()
    const intervalSelect = createSelectInterval()

    marketSettings.querySelector('.symbol-select').appendChild(symbolSelect)
    marketSettings.querySelector('.symbol-select select').value = options.symbol.toLowerCase()
    
    marketSettings.querySelector('.interval-select').appendChild(intervalSelect)
    marketSettings.querySelector('.interval-select select').value = options.interval

    symbolSelect.addEventListener('change', (e) => updateChartOptions(chartId, { symbol: e.target.value, interval: intervalSelect.value }))
    intervalSelect.addEventListener('change', (e) => updateChartOptions(chartId, { symbol: symbolSelect.value, interval: e.target.value }))

    const minimizedChart = document.createElement('div');
    minimizedChart.id = `window-${chartId}-minimized`
    minimizedChart.classList.add('minimized-window', 'maximized-chart');
    minimizedChart.innerHTML = `<span class="minimized-name" style="place-self: center;">Chart ${chartId}</span>
        <button type="button" class="btn btn-2" data-bs-toggle="modal" data-bs-target="#modal-${chartId}" style="margin-right: 4px;">
        <i class="bi bi-x"></i>
        </button>
        <button type="button" class="btn btn-2" id="window-${chartId}-chart-options-maximize">
        <i class="bi bi-arrows-angle-expand"></i>
        </button>`

    const modal = document.createElement('div')
    modal.innerHTML = `<div class="modal fade" id="modal-${chartId}" tabindex="-1" aria-labelledby="Modal${chartId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="Modal${chartId}Label">Are you sure you want to delete Chart ${chartId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-1" id="window-${chartId}-chart-options-close" data-bs-dismiss="modal">Delete</button>
            </div>
        </div>
        </div>
    </div>`

    return { 
        window: window,
        minimizedChart: minimizedChart,
        modal: modal.firstElementChild
     }

}

// Add Bot button
function addBotButtonAndModal(chartId) {
    // acced to the chart window and then to the Add Bot popup
    const popup = document.getElementById(`add-bot-modal-${chartId}`);

    // TODO automatic way for the moment, will be added 2EMA
    
    const strategySelect = popup.querySelector('.strategies-select')
    appendOptionsToStrategySelect(strategySelect)

    strategySelect.addEventListener('change', updateModalWithStrategy(chartId, strategySelect.value));

    // once the button for creating a bot is clicked, send request to server DB and server Process, to add this bot
    popup.querySelector('#addBot-button').addEventListener('click', async () => await createBot(chartId))
}

async function createBot(chartId) { // what do I need? options from modal and Id of the chart for the 

    // create bot id
    const botId = createId()

    // get all values setted on the modal for the bot options

    // send request to serverProcess
    // (from serverProcess send request to serverDB to store the bot with all the options and status (true))

    // if the response from the request is ok, add it to html
    // if not, toast bad request

    const addBotModalContainer = document.getElementById(`add-bot-modal-${chartId}`);
    const staticValuesContainer = addBotModalContainer.querySelector('.static-bot-values');
    const optionsContainer = addBotModalContainer.querySelectorAll('.container-strategy-options > div')
    
    let customOptions = {};
    optionsContainer.forEach(optionContainer => {
        customOptions[optionContainer.id] = optionContainer.querySelector('input').value;
    });

    const values = {
        name: staticValuesContainer.querySelector('input').value,
        strategy: staticValuesContainer.querySelector('select.strategies-select').value,
        custom: customOptions,
        status: true,
        operation: {state: '', price: 'Awaiting entry', percentage: ''}
    }

    const status = await createBotDB({
        botId, botName: values.name, botStrategy: values.strategy, botOptions: customOptions, botStatus: true
    }, chartId)
    console.log('CreateBotDB', status)
    if(!status) return

    loadBotIntoHtml(chartId, botId, values)
}

function loadBotIntoHtml(chartId, botId, values) {
    document.querySelector(`#botAccordion-${chartId}`).appendChild(createHtmlBot(chartId,botId,values))
    createHtmlOperation(chartId, botId, values)
}

function createHtmlBot(chartId, botId, options) { 
    /**
     * options: {
     *  name: "",
     *  strategy: "",
     *  custom: [
     *      { ema_short_period: 3 },
     *      { ema_long_period: 6 }
     *  ]
     * }
     */
    console.log(options)
    let botHtml = document.createElement('div')
    botHtml.classList.add('accordion-item')
    botHtml.id = `accordion-bot-${botId}`
    botHtml.innerHTML = `
    <h2 class="accordion-header" id="heading${botId}">
      <div class="accordion-button">
        <div class="accordion-button-container">
          <span class="accordion-button-container-span">Bot ${options.name}</span>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="status-bot-${botId}" ${options.status ? 'checked':''}>
          </div>
          <i class="bi bi-trash-fill" data-bs-toggle="modal" data-bs-target="#modal-bot-${botId}"></i>
          <i class="bi bi-caret-down-fill text-collapsed" data-bs-toggle="collapse" data-bs-target="#collapse-bot-${botId}" aria-expanded="false" aria-controls="collapse-bot-${botId}" type="button"></i>
          <i class="bi bi-caret-up-fill text-expanded" data-bs-toggle="collapse" data-bs-target="#collapse-bot-${botId}" aria-expanded="false" aria-controls="collapse-bot-${botId}" type="button"></i>
        </div>
      </div>
    </h2>
    <div id="collapse-bot-${botId}" class="accordion-collapse collapse p-2" aria-labelledby="heading${botId}" data-bs-parent="#botAccordion-${chartId}">
      <div class="d-flex flex-column">
        <!--<div class="d-flex flex-row align-items-center mb-2">
          <span class="col-md-6">Name</span>
          <input class="col-md-6 form-control" type="text" placeholder="Default input" aria-label="default input example">
        </div>-->
        <div class="d-flex flex-row align-items-center mb-2 strategy-container">
          <span class="col-md-6">Strategy</span>
          <select class="col-md-6 form-select" id="strategy-select-bot-${botId}">
          </select>
        </div>
      </div>
      <div class="d-flex flex-column">
        <button class="btn btn-1 mt-2" id="save-bot-options-${botId}">Save bot options</button>
      </div>
    </div>
    <div class="modal fade" id="modal-bot-${botId}" tabindex="-1" aria-labelledby="Modal-bot-${botId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="Modal-bot-${botId}Label">Are you sure you want to delete Bot ${options.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-1" id="delete-bot-${botId}" data-bs-dismiss="modal">Delete</button>
            </div>
        </div>
        </div>
    </div>`
    const strategySelect = botHtml.querySelector(`#strategy-select-bot-${botId}`)
    appendOptionsToStrategySelect(strategySelect)
    const collapseContainer = botHtml.querySelector(`#collapse-bot-${botId} > div`)

    // DELETE BOT
    botHtml.querySelector(`#delete-bot-${botId}`).addEventListener('click', () => deleteBot(chartId, botId))

    // STATUS BOT
    botHtml.querySelector(`#status-bot-${botId}`).addEventListener('change', (e) => updateBotStatus(chartId, botId, e.target.checked))

    // STRATEGY OPTIONS BOT
    botHtml.querySelector(`#save-bot-options-${botId}`).addEventListener('click', (e) => updateBotStrategyOptions(chartId, botId, getInputBotOptions(botHtml.querySelector(`#collapse-bot-${botId} > div`))))
    

    Object.keys(options.custom).forEach(objectKey => {
        let div = document.createElement('div');
        div.classList.add('d-flex','flex-row','align-items-center','mb-2', 'bot-options-container');
        div.id = objectKey
        div.innerHTML =`
        <span class="col-md-6">${objectKey}</span>
        <input class="col-md-6 form-control" type="text" value="${options.custom[objectKey]}">
        `;
        collapseContainer.appendChild(div);
    })

    return botHtml
}

function createHtmlOperation(chartId, botId, values) {

    const { name, operation } = values;

    const operationFatherContainer = document.getElementById('actual-operations');
    const operationContainer = document.createElement('div');
    operationContainer.id = `operation-${chartId}-${botId}`;
    operationContainer.classList.add('d-flex', 'flex-row', 'operation-container');
    operationContainer.innerHTML = `
        <div class="bot-name">${name}</div>
        <div class="operation-entry-price">${operation.price == 'Awaiting entry' ? operation.price : parseFloat(operation.price).toFixed(2)}</div>
        <div class="operation-state">${operation.state.replace(/([A-Z])/g, ' $1').trim()}</div>
        <div class="operation-percentage">${operation.percentage}</div>
        <button id="stop-operation-${chartId}-${botId}" class="stop-operation btn btn-1">Stop operation</button>
    `

    operationContainer.onclick = () => {
        console.log('Stop operation', chartId, botId)
    }

    operationFatherContainer.appendChild(operationContainer)

}

function updateHtmlOperation(operationData) {
    const { botId, chartId, operation } = operationData;

    const operationContainer = document.getElementById(`operation-${chartId}-${botId}`);
    operationContainer.querySelector('div.operation-entry-price').textContent = parseFloat(operation.price).toFixed(2);
    operationContainer.querySelector('div.operation-state').textContent = operation.state.replace(/([A-Z])/g, ' $1').trim();
    operationContainer.querySelector('div.operation-percentage').textContent = operation.percentage;
}

function createSelectSymbol() {
    const select = document.createElement('select')
    select.classList.add('col-md-6','form-select')

    const symbols = getSymbols();
    symbols.forEach(symbol => {
        let opt = document.createElement('option');
        opt.value = symbol.toLowerCase();
        opt.innerHTML = symbol;
        select.appendChild(opt)
    })

    // add select on change event listener

    return select
}

function createSelectInterval() {
    const select = document.createElement('select')
    select.classList.add('col-md-6','form-select')

    const intervals = getIntervals();
    intervals.forEach(interval => {
        let opt = document.createElement('option');
        opt.value = interval.value;
        opt.innerHTML = interval.label;
        select.appendChild(opt)
    })

    return select
}

function getInputBotOptions(container) {
    let customOptions = {};
    const optionsContainers = container.querySelectorAll('div.bot-options-container');
    optionsContainers.forEach(optionContainer => {
        customOptions[optionContainer.id] = optionContainer.querySelector('input').value;
    })

    return {strategy: container.querySelector(`select`).value, strategyOptions: customOptions}
}


function changeProcess(chartId, botId) {
    /**Change html of the operation with the chartId and BotId, has to be changed:
     * - price
     * - process
     * - button (??)
     */
}

(async function () {
    console.log('check login status')
    const status = await checkLoginStatus()
    if(!status) location.href = 'home.html'
    await loadChartsFromDB(username_gbl)
})();
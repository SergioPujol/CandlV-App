function minmaxWindows() {
    document.querySelectorAll('.window').forEach(window => {
        let id = window.id
        document.getElementById(`${id}-chart-menu`).querySelector('button').onclick = ()=>{
            if(document.getElementById(`${id}-data`).classList.contains('hide-data')) document.getElementById(`${id}-data`).classList.remove('hide-data')
            else document.getElementById(`${id}-data`).classList.add('hide-data')        
        }
    
        document.getElementById(`${id}-chart-options-close`).onclick = ()=>{
            window.remove()
            document.getElementById(`${id}-minimized`).remove()
        }
    
        document.getElementById(`${id}-chart-options-minimize`).onclick = ()=>{
            window.classList.add('minimize-chart')
            document.getElementById(`${id}-minimized`).classList.remove('maximized-chart')
        }
    
        document.getElementById(`${id}-chart-options-maximize`).onclick = ()=>{
            window.classList.remove('minimize-chart')
            document.getElementById(`${id}-minimized`).classList.add('maximized-chart')
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
    const strategyContainer = document.querySelector(`#window-${chartId} #add-bot-modal-${chartId} .container-strategy-options`);
    const strategyOptions = strategies[strategy]

    Object.keys(strategyOptions).forEach(option => {
        let div = document.createElement('div')
        div.classList.add('d-flex', 'flex-row', 'align-items-center', 'mb-2')
        div.innerHTML = `
            <span class="col-md-6">${option.replaceAll('_', ' ')}</span>
            <input class="col-md-6 form-control" type="text" placeholder="Bot name" value="${strategyOptions[option]}"/>`;
        strategyContainer.appendChild(div)
    })
}

document.getElementById('add-chart').querySelector('button').addEventListener('click', ()=>createWindow())
function createWindow() {

    // create chart id
    const chartId = createId()

    // TODO


    // info from select
    const addChartContainer = document.getElementById('add-chart')
    const values = {
        symbol: addChartContainer.querySelector('#add-chart-symbol').value,
        interval: addChartContainer.querySelector('#add-chart-interval').value
    }
    const { window, minimizedChart, modal } = createHtmlWindow(chartId, values);
    document.querySelector('.charts-information').appendChild(window);
    document.querySelector('.charts-information > .minimized-charts').appendChild(minimizedChart);
    document.querySelector('.charts-information > .modals').appendChild(modal);

    addBotButttonAndModal(chartId)

    minmaxWindows()

}

function createHtmlWindow(chartId, options) {
    const window = document.createElement('div')
    window.id = `window-${chartId}`
    window.classList.add('window')
    window.innerHTML = `
        <div id="window-${chartId}-chart" class="chart flex-grow-1">
        <div id="window-${chartId}-chart-buttons" class="chart-buttons">
            <div class="chart-menu" id="window-${chartId}-chart-menu">
            <button type="button" class="btn btn-2">
                <i class="bi bi-list"></i>
            </button>
            </div>
            <div class="chart-options" id="window-${chartId}-chart-options">
            <button type="button" class="btn btn-2" data-bs-toggle="modal" data-bs-target="#modal-${chartId}">
                <i class="bi bi-x"></i>
            </button>
            <button type="button" class="btn btn-2" id="window-${chartId}-chart-options-minimize">
                <i class="bi bi-dash"></i>
            </button>
            </div>
        </div>
        
        <div class="position-absolute top-50 start-50 translate-middle"><h1 style="color: white;">Chart ${chartId}</h1></div>
        
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

            <div class="collapse multi-collapse market-settings" id="window-${chartId}-data-market">
            <div class="d-flex flex-column">
                <div class="d-flex flex-row align-items-center mb-2">
                <span class="col-md-6">Symbol</span>
                <select class="col-md-6 form-select">
                    <option value="btcusdt" selected>BTCUSDT</option>
                    <option value="ethusdt">ETHUSDT</option>
                    <option value="bnbusdt">BNBUSDT</option>
                </select>
                </div>
                <div class="d-flex flex-row align-items-center mb-2">
                <span class="col-md-6">Interval</span>
                <input class="col-md-6 form-control" type="text" placeholder="Interval"  id="add-chart-interval">
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
                <button class="btn btn-1 mt-2 add-bot" data-bs-toggle="modal" data-bs-target="#add-bot-modal-${chartId}">Add Bot</button>
            </div>
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
                <div>

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
    console.log(marketSettings)
    marketSettings.querySelector('select').value = options.symbol.toLowerCase()
    marketSettings.querySelector('input').value = options.interval

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
function addBotButttonAndModal(chartId) {
    // acced to the chart window and then to the Add Bot popup
    const popup = document.querySelector(`#window-${chartId} #add-bot-modal-${chartId}`);

    // TODO automatic way for the moment, will be added 2EMA
    
    const strategySelect = popup.querySelector('.strategies-select')
    appendOptionsToStrategySelect(strategySelect)

    strategySelect.addEventListener('change', updateModalWithStrategy(chartId, strategySelect.value));

    // once the button for creating a bot is clicked, send request to server DB and server Process, to add this bot
    popup.querySelector('#addBot-button').addEventListener('click', () => createBot(chartId))
}

function createBot(chartId) { // what do I need? options from modal and Id of the chart for the 

    // create bot id
    const botId = createId()

    // get all values setted on the modal for the bot options

    // send request to serverProcess
    // (from serverProcess send request to serverDB to store the bot with all the options and status (true))

    // if the response from the request is ok, add it to html
    // if not, toast bad request

    document.querySelector(`#botAccordion-${chartId}`).appendChild(createHtmlBot(botId,{
        name: '2emote',
        strategy: '2EMA',
        custom: [
            { ema_short_period: 3 },
            { ema_long_period: 6 }
        ]
    }))
}

function createHtmlBot(botId, options) { 
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
    let botHtml = document.createElement('div')
    botHtml.classList.add('accordion-item')
    botHtml.innerHTML = `
    <h2 class="accordion-header" id="heading${botId}">
      <div class="accordion-button">
        <div class="accordion-button-container">
          <span class="accordion-button-container-span">Bot ${options.name}</span>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="status-bot-${botId}" checked>
          </div>
          <i class="bi bi-trash-fill"></i>
          <i class="bi bi-caret-down-fill text-collapsed" data-bs-toggle="collapse" data-bs-target="#collapse-bot-${botId}" aria-expanded="true" aria-controls="collapse-bot-${botId}" type="button"></i>
          <i class="bi bi-caret-up-fill text-expanded" data-bs-toggle="collapse" data-bs-target="#collapse-bot-${botId}" aria-expanded="true" aria-controls="collapse-bot-${botId}" type="button"></i>
        </div>
      </div>
    </h2>
    <div id="collapse-bot-${botId}" class="accordion-collapse collapse show p-2" aria-labelledby="heading${botId}" data-bs-parent="#botAccordion">
      <div class="d-flex flex-column">
        <!--<div class="d-flex flex-row align-items-center mb-2">
          <span class="col-md-6">Name</span>
          <input class="col-md-6 form-control" type="text" placeholder="Default input" aria-label="default input example">
        </div>-->
        <div class="d-flex flex-row align-items-center mb-2">
          <span class="col-md-6">Strategy</span>
          <select class="col-md-6 form-select" id="strategy-select-bot-${botId}">
          </select>
        </div>
      </div>
    </div>`
    const strategySelect = botHtml.querySelector(`#strategy-select-bot-${botId}`)
    appendOptionsToStrategySelect(strategySelect)
    const collapseContainer = botHtml.querySelector(`#collapse-bot-${botId} > div`)
    options.custom.forEach(object => {
        const entries = Object.entries(object); // pos 0 name of input, pos 1 value of input
        console.log(entries)
        let div = document.createElement('div');
        div.classList.add('d-flex','flex-row','align-items-center','mb-2');
        div.innerHTML =`
        <span class="col-md-6">${entries[0][0]}</span>
        <input class="col-md-6 form-control" type="text" value="${entries[0][1]}">
        `;
        collapseContainer.appendChild(div);
    })

    return botHtml
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

    return select
}

function getSymbols() {
    // get posible symbols with fetch
    return ['BTCUSDT','ETHUSDT','BNBUSDT']
}

function createId() {
    return (Math.random()+1).toString(36).substring(2);
}

(async function () {
    console.log('check login status')
    const status = await checkLoginStatus()
    //if(!status) location.href = 'home.html'
})();
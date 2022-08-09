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

addBot('5mj43s')
// Add Bot button
function addBot(chartId) {
    // acced to the chart window and then to the Add Bot popup
    const popup = document.querySelector(`#window-${chartId} #add-bot-modal-${chartId}`);

    // TODO automatic way for the moment, will be added 2EMA
    const strategies = {
        '2EMA': {
            ema_short_period: 3, // default value
            ema_long_period: 6 // default value
            // TODO, add more options to 2EMA
        },
    }
    const strategySelect = popup.querySelector('.strategies-select')
    Object.keys(strategies).forEach(strategy => {
        let option = new DOMParser().parseFromString(`<option value="${strategy}">${strategy}</option>`, "text/xml");
        strategySelect.appendChild(option.documentElement)
    })
    strategySelect.firstElementChild.setAttribute("selected", "");
}

(async function () {
    console.log('check login status')
    const status = await checkLoginStatus()
    if(!status) location.href = 'home.html'
})();
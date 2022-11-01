var username_gbl = '';

var strategies = {
    '2EMA': {
        ema_short_period: 3, // default value
        ema_long_period: 6 // default value
    },
    'MACD': {
        ema_short_period: 12, // default value
        ema_long_period: 26, // default value
        signal_period: 9 // default value
    },
    'Bollinger': {
        period: 20, // default value
        times: 2, // default value
    }
};

async function checkToken() {
    const result = await fetch('/api/checktoken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem('token')
        })
    }).then((res) => res.json())

    return result;
}

function toggleContainer(bool) {
    if(bool) { // logged-user block / non-logged-user hide
        document.getElementById('non-logged-user').classList.add("login-container-hide");
        document.getElementById('logged-user').classList.remove("login-container-hide");
        document.getElementById('logout').onclick = logout
    } else {
        document.getElementById('non-logged-user').classList.remove("login-container-hide");
        document.getElementById('logged-user').classList.add("login-container-hide");
    }
}

async function checkLoginStatus() {
    if(!localStorage.getItem('token')) {
        toggleContainer(false)
        return false
    } 
    const tokenRes = await checkToken();
    console.log(tokenRes)
    if(tokenRes.status == 'ok') {
        document.getElementById('usernameButton').textContent = tokenRes.data
        username_gbl = tokenRes.data
        console.log(username_gbl)
        toggleContainer(true)
        return true
    } else {
        toggleContainer(false)
        return false
    }
}

function logout() {
    localStorage.removeItem('token');
    location.href = 'home.html'
}

const form_settings = document.getElementById('form_settings')
form_settings.addEventListener('submit', registerKeys)
async function registerKeys() {
    event.preventDefault()
    const pb_bkey = document.getElementById('pb_bkey').value
    const pv_bkey = document.getElementById('pv_bkey').value
    const testnet = document.getElementById('testnetCheckbox').checked

    const result = await fetch('/api/registerKeys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pb_bkey,
            pv_bkey,
            testnet
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Saved, restart App to complete the change');
    } else {
        showError(result.error)
    }
}

const form_import_strategies = document.getElementById('import-strategy-container')
form_import_strategies.addEventListener('submit', importStrategy)
async function importStrategy() {
    event.preventDefault()
    if(document.getElementById('import-strategy-file').files.length == 0 || document.getElementById('import-strategy-object').value == '') {
        showError('Add strategy object and file for importing a strategy')
        return
    }
    var strategyObject;
    try {
        strategyObject = JSON.parse(document.getElementById('import-strategy-object').value)
    } catch (error) {
        showError('Strategy object format is not correct')
        return
    }
    const path = document.getElementById('import-strategy-file').files[0].path

    const result = await fetch('/api/importStrategy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            strategyObject,
            path
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Custom strategy added');
    } else {
        showError(result.error)
    }
}

var customStrategies = {}
async function loadCustomStrategies() {
    const result = await fetch('/api/getStrategyObjects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        strategies = { ...strategies, ...({ ...customStrategies, ...Object.assign({}, ...result.strategiesObjects )}) }
        console.log('strategies', strategies)
    } else {
        showError(result.error)
    }
}

/** REGISTER FORM */
//const form_reg = document.getElementById('form_reg')
//form_reg.addEventListener('submit', registerUser)

async function registerUser(event) {
    event.preventDefault()
    const username = document.getElementById('username_reg').value
    const password = document.getElementById('password_reg').value

    const result = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Registered')
    } else {
        showError(result.error)
    }
}

/** LOGIN FORM */
//const form_log = document.getElementById('form_login')
//form_log.addEventListener('submit', login)

async function login(event) {
    event.preventDefault()
    const username = document.getElementById('username_log').value
    const password = document.getElementById('password_log').value

    const result = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        console.log('Got the token: ', result.data)
        localStorage.setItem('token', result.data)
        showSuccess('Logged')
        location.reload()
    } else {
        showError(result.error)
    }
}

function showError(message) {
    buildToast(message, 'Error', '#B53737');
}

function showSuccess(message) {
    buildToast(message, 'Success', '#00FF00');
}

function buildToast(text, type, color) {
    const div = document.createElement('div');
    div.classList.add('temp-div-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3');
    div.style.zIndex = 11;
    div.innerHTML = `
        <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <svg class="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="${color}"></rect></svg>
                <strong class="me-auto">${type}</strong>
                <!--<small>Just now</small>-->
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${text}
            </div>
        </div>`
    document.body.appendChild(div)
    var toast = bootstrap.Toast.getOrCreateInstance(div.querySelector('.toast'))
    toast.show();
    setTimeout(()=> { 
        toast.hide();
        setTimeout(() => div.remove(), 1000)
    }, 2500);

}
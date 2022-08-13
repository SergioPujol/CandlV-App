var username_gbl = '';

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


/** REGISTER FORM */
const form_reg = document.getElementById('form_reg')
form_reg.addEventListener('submit', registerUser)

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
        alert('Success')
    } else {
        alert(result.error)
    }
}

/** LOGIN FORM */
const form_log = document.getElementById('form_login')
form_log.addEventListener('submit', login)

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
        alert('Success')
        location.reload()
    } else {
        alert(result.error)
    }
}

function showError(message) {
    // TODO add toast message
    console.log(message)
}
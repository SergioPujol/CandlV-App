document.getElementById('authenticate').onclick = authenticate

var instanceID = null

function setInstanceID(id) {
    instanceID = id
    console.log('instanceID setted', instanceID)
}

function authenticate() {
    const keyValue = document.getElementById('auth_key').value;

    if(!keyValue) showError('Insert valid Key');
    else if(instanceID == null) showError('Not valid machine');
    else {
        verifyKey(keyValue)
    }
}

async function verifyKey(key) {
    const result = await fetch('/api/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key,
            instanceID
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        console.log('Verified')
        location.href = 'trading.html'
    } else {
        showError(result.error)
    }
}
const { app, BrowserWindow } = require('electron');
const got = require('got');

const { machineId } = require('node-machine-id');

app.whenReady().then(async () => {
  
    const win = new BrowserWindow({ width: 1850, height: 1000, show: false, icon: __dirname + '/icons/CV.png', autoHideMenuBar: true, })

    // Load a remote URL
    win.loadURL('http://localhost:3000')

    win.once('ready-to-show', async () => {
        console.log('ready-to-show')
        win.show()
        machineId().then((id) => {
            sendInstanceIDToWeb({ instanceID: id })
        })
    })

    win.once('closed', async () => {
        stopApp()
        sendStopAllBots();
    })

})

process.on('exit', function(code) {
  return console.log(`exiting the code implicitly ${code}`);
});

const stopApp = () => {
  console.log('Stop App')
  process.exit(0);
}

// ServerDB

const sendStopAllBots = async () => {
    console.log('sendStopAllBots')
    return await serverDBReq('bot', {
		method: 'stopAllBots',
		data: {}
	})
}

const serverDBReq = async (req, data) => {
	const res = await got.post(`http://localhost:3100/${req}/`, { json: data });
	if(res.statusCode == 200) return JSON.parse(res.body)
	return { status: 'error', error: 'Server not available' }
}


// Web

const sendInstanceIDToWeb = async (data) => {
    return await serverWebReq('instanceID', data)
}

const serverWebReq = async (req, data) => {
	const res = await got.post(`http://localhost:3000/${req}/`, { json: data });
	if(res.statusCode == 200 && JSON.parse(res.body).status) return true 
	return false
}
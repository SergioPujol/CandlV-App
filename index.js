const { app, BrowserWindow } = require('electron');

const fs = require("fs");
const path = require("path");
const got = require('got');

app.whenReady().then(async () => {
  
    const win = new BrowserWindow({ width: 1850, height: 1000, show: false, icon: __dirname + '/icons/CV.png', autoHideMenuBar: true, })

    await sleep(10000)
    // Load a remote URL
    win.loadURL('http://localhost:3000')

    win.once('ready-to-show', async () => {
        console.log('ready-to-show')
        win.show()
    })

    win.once('closed', async () => {
        stopApp()
        sendStopAllBots();
        clearCustomStrategiesFolder();
    })

})

process.on('exit', function(code) {
  return console.log(`exiting the code implicitly ${code}`);
});

const stopApp = () => {
  console.log('Stop App')
  process.exit(0);
}

const clearCustomStrategiesFolder = async () => {
    console.log('clearCustomStrategiesFolder')
    const directory = "Server_Process/CustomStrategies";

    fs.readdir(directory, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
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

const serverWebReq = async (req, data) => {
	const res = await got.post(`http://localhost:3000/${req}/`, { json: data });
	if(res.statusCode == 200 && JSON.parse(res.body).status) return true 
	return false
}


const sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
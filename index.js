const { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  
    const win = new BrowserWindow({ width: 1700, height: 1000 })

    // Load a remote URL
    win.loadURL('http://localhost:3000')
})
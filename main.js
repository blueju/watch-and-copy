const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

console.log(app.getPath("userData"));

// 创建主窗口
app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // 开启Chrome控制台
  mainWindow.webContents.openDevTools()
  mainWindow.loadFile('./src/renderer/index.html')

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.send('first-start')
  })

})

// 选择源文件夹
ipcMain.on("select-source-dir", (event) => {
  dialog.showOpenDialog({
    title: "选择源文件夹",
    properties: ["openDirectory"]
  }, (dirPaths) => {
    event.sender.send("selected-source-dir-paths", dirPaths)
  })
})

// 选择目标文件夹
ipcMain.on("select-target-dir", (event) => {
  dialog.showOpenDialog({
    title: "选择目标文件夹",
    properties: ["openDirectory"]
  }, (dirPaths) => {
    event.sender.send("selected-target-dir-paths", dirPaths)
  })
})
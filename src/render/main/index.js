'use strict'

import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron'
import routes from './routes'
// import { configureBuildCommand } from 'electron-builder/out/builder'
const config = require('../../config/config')
// config.port = Math.floor(Math.random() * (9999 - 1000)) + 1000
// import rageEdit from './registry'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow = null
let loginWindow = null

const gotTheLock = app.requestSingleInstanceLock()
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9088/#home`
  : `file://${__dirname}/index.html#home`

const loginURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9088' : `file://${__dirname}/index.html`

const express = require('express')

function createMainWindow () {
  mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    minWidth: 800,
    minHeight: 600,
    useContentSize: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false // 本地文件加载失败问题
    },
    title: '无忧密存'
  })

  mainWindow.loadURL(winURL)
  // mainWindow.webContents.openDevTools() // 打包后打开控制台
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.hide()

  // mainWindow.webContents.openDevTools()
}

function createLoginWindow () {
  console.log('--------createLoginWindow')
  if (loginWindow) {
    return
  }
  /**
   * Initial window options
   */
  loginWindow = new BrowserWindow({
    show: true,
    height: 360,
    width: 300,
    maxHeight: 360,
    maxWidth: 300,
    useContentSize: true,
    frame: false, // 无边框
    transparent: false, // 透明
    // fullscreen: true, // 全屏,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false // 本地文件加载失败问题
    }
  })

  loginWindow.loadURL(loginURL)

  // 为了防止闪烁，让画面准备好了再显示
  // 对于一个复杂的应用，ready-to-show 可能发出的太晚，会让应用感觉缓慢。 在这种情况下，建议立刻显示窗口，并使用接近应用程序背景的 backgroundColor
  // 请注意，即使是使用 ready-to-show 事件的应用程序，仍建议使用设置 backgroundColor 使应用程序感觉更原生。
  loginWindow.once('ready-to-show', () => {
    loginWindow.show()
  })

  loginWindow.on('close', (event) => {
    app.quit()
  })

  loginWindow.on('closed', () => {
    loginWindow = null
  })

  ipcMain.on('openMainWindow', () => {
    console.log('----------openMainWindow')
    if (!mainWindow) {
      createMainWindow()
    }

    // loginWindow.hide()
    if (loginWindow) {
      loginWindow.destroy()
    }

    // mainWindow.reload()
    mainWindow.show()
    mainWindow.focus()
  })

  ipcMain.on('openLoginWindow', () => {
    console.log('----------openLoginWindow')
    if (!loginWindow) {
      createLoginWindow()
    }

    // loginWindow.hide()
    mainWindow.destroy()
    loginWindow.show()
    loginWindow.focus()
  })
}

ipcMain.on('reluncher', (event) => {
  if (mainWindow) {
    mainWindow.hide()
    mainWindow.close()
  }
  createLoginWindow()
})

ipcMain.on('close', e => {
  if (loginWindow) {
    loginWindow.close()
  }
  if (mainWindow) {
    mainWindow.close()
  }
})

function createWindow () {
  const app = express()
  var bodyParser = require('body-parser')
  app.use(bodyParser.json({
    limit: '50mb'
  }))
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }))
  // 跨域设置
  app.all('*', (req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
      res.header('Access-Control-Allow-Credentials', true)
      res.header('Access-Control-Allow-Origin', req.headers['origin'] || '*')
      res.header('Access-Control-Allow-Headers', 'X-Requested-With')
      res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
      res.header('Content-Type', 'application/json;charset=utf-8')
    }
    next()
  })
  app.use('/', routes)
  app.listen(config.port, () => {
    console.log('server running @ http://localhost:' + config.port)
  })
  /**
   * Initial window options
   */
  createLoginWindow()
}
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      global.sharedObject = {
        prop1: process.argv
      }
      mainWindow.webContents.send('getRightPath', commandLine, workingDirectory)
      /* dialog.showMessageBox({
        title: 'second',
        message: 'second:' + commandLine + ' workingDirectory' + workingDirectory
      }) */
    } else {
      if (app.isReady()) createWindow()
      global.sharedObject = {
        prop1: process.argv
      }
    }
  })
  // mac环境
  app.on('open-url', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      global.sharedObject = {
        prop1: process.argv
      }
      mainWindow.webContents.send('getRightPath', commandLine, workingDirectory)
    } else {
      if (app.isReady()) createWindow()
      global.sharedObject = {
        prop1: process.argv
      }
    }
  })
  // 创建 myWindow, 加载应用的其余部分, etc...
  app.on('ready', () => {
    createWindow()
    //  打印命令行携带参数
    // console.log(process.argv)
    // //  拿到命令行携带参数解开最后一个值  我这里使用=号连接
    // /* let list = process.argv[process.argv.length - 1].split('=')
    // list = list[list.length - 1] */
    // let list = process.argv
    // // console.log('123', list)
    // //  接收指令 treeUrl 得跟 发送时的 保持一致 (我的理解: 接收页面通知) 之后  执行function的内容
    /* ipcMain.on('rightPath', function (e, msg) {
    //   //  发送指令 getTreeUrl
      e.sender.send('getRightPath', process.argv)
    }) */
    global.sharedObject = {
      prop1: process.argv
    }
    // mainWindow.webContents.send('getRightPath', process.argv)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  app.quit()
})

app.on('activate', () => {
  console.log('---------- activate ----------')
  if (loginWindow === null && mainWindow === null) {
    createLoginWindow()
  }
  if (loginWindow) {
    loginWindow.focus()
    return
  }

  if (mainWindow === null) {
    createWindow()
  }
})

// 登录窗口最小化
ipcMain.on('min', e => {
  mainWindow.minimize()
})

// 登录窗口最大化
ipcMain.on('max', function () {
  if (mainWindow.isMaximized()) {
    mainWindow.restore()
  } else {
    mainWindow.maximize()
  }
})

/* function beforeOpen () {
  const dest = `${os.homedir}/Library/Services/Upload pictures with PicGo.workflow`
  if (fs.existsSync(dest)) { // 判断是否存在
    return true
  } else { // 如果不存在就复制过去
    try {
      fs.copySync(path.join(__static, 'Upload pictures with PicGo.workflow'), dest)
    } catch (e) {
      console.log(e)
    }
  }
}

if (process.platform === 'darwin') {
  beforeOpen()
} */
/* rageEdit.setRightMenu('密存加密')
rageEdit.setRightMenu('密存解密') */
/* const regedit = require('regedit') // 引入regedit
regedit.putValue({
  // eslint-disable-next-line no-useless-escape
  'HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers': {
    'vanish2': {
      value: '1',
      type: 'REG_SZ' // type值为REG_DEFAULT时，不会自动创建新的name
    },
    'vanish6': {
      value: '2',
      type: 'REG_SZ' // type值为REG_DEFAULT时，不会自动创建新的name
    }
  }
}, function (err) {
  console.log(err)
}) */
/* const { spawn } = require('child_process')
let batPath = require('path').join(__dirname, '/static', '123.bat')
let bat = spawn('cmd.exe', ['/c', batPath])
bat.stdout.on('data', function (data) {
  console.log(data)
})
bat.stderr.on('data', function (data) {
  console.log(data)
}) */
/* exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
}); */
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

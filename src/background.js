'use strict'

import {app, protocol, BrowserWindow, Menu, nativeImage, Tray, ipcMain} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer'
import {stopMailServer} from "./server/event/mailEvent"

require('./server/server')

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow;
let tray

require('@electron/remote/main').initialize()

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {scheme: 'app', privileges: {secure: true, standard: true}}
])

async function createWindow() {
  // 隐藏菜单栏
  // Menu.setApplicationMenu(null)
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 320,
    height: 420,
    // frame: false,
    center: true,
    titleBarStyle: 'hidden',
    maximizable: false,
    minimizable: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/login', {userAgent: 'PC'})
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await mainWindow.loadURL('app://./index.html/#/login', {userAgent: 'PC'})
    mainWindow.webContents.openDevTools()
  }
  require("@electron/remote/main").enable(mainWindow.webContents);

  mainWindow.on('close', e => {
    e.preventDefault();
    mainWindow.hide();
  });
}

async function creatTray() {
  const icon = nativeImage.createFromPath(`${__static}/logo/logo_32.png`)
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {label: '会员中心', type: 'normal'},
    {label: '邮箱设置', type: 'normal'},
    {label: '通用设置', type: 'normal'},
    {label: '关于', type: 'normal'},
    {type: 'separator'},
    {
      label: '退出应用',
      click(menuItem, browserWindow, event) {
        stopMailServer()
          .finally(() => {
              mainWindow.webContents.send('renderExit')
              mainWindow = null
            }
          )
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('司空')
  // 任务栏点击事件
  tray.on('click', (e) => mainWindow.show())
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  await createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// windows上，需要正确设置appUserModelId，才能正常显示通知，不然通知的应用标识会显示为：electron.app.xxx
app.on('will-finish-launching', () => {
  app.setAppUserModelId("shop.liaozalie.sikong")
})

ipcMain.on('login', (event, loginInfo) => {
  console.log(loginInfo)
  mainWindow.setMinimumSize(1200, 770)
  mainWindow.setSize(1200, 770)
  mainWindow.setMinimizable(true)
  mainWindow.setMaximizable(true)
  mainWindow.center()
  if (!tray || !tray.isDestroyed()) {
    creatTray()
  }
})

ipcMain.on('logout', async event => {
  await stopMailServer()
  mainWindow.setMinimumSize(320, 420)
  mainWindow.setSize(320, 420)
  mainWindow.setMinimizable(false)
  mainWindow.setMaximizable(false)
  mainWindow.center()
  if (tray && !tray.isDestroyed()) {
    await tray.destroy()
    tray = null
  }
  event.reply('logout-reply')
})

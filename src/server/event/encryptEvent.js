import {ipcMain} from "electron"
import getMAC from 'getmac'

ipcMain.on('mac', event => {
  const mac = getMAC().replace(/:/g, "-")
  console.log(mac)
  event.returnValue = mac
})
console.log('encryptEvent is loaded!')

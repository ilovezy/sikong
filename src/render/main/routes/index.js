import { getPathInfo } from '../utils/util'
import { getParams, getSecretText, getFileId } from '../utils/encrypt'
import { encryptFile, decryptFile, burstFile } from '../utils/AESFile'
import { exec } from 'child_process'
const express = require('express')
var bodyParser = require('body-parser')
var app = express()
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(jsonParser)
app.use(urlencodedParser)
const router = express.Router()
const os = require('os')

router.get('/getPathInfo', (req, res, next) => {
  let _path = req.query.pathname
  let userInfo = os.userInfo()
  // 为空时默认取桌面信息，并取盘符
  let pathName = _path
  if (_path === 'Desktop') {
    pathName = userInfo.homedir.replace(/\\/g, '/') + '/Desktop'
  }
  try {
    let result = getPathInfo(pathName)
    res.json({
      status: true,
      data: result,
      path: pathName
    })
  } catch (error) {
    res.json({
      status: false,
      msg: `无法打开${pathName}`
    })
  }
})
router.get('/getUserFolder', (req, res, next) => {
  let userInfo = os.userInfo()
  let pathName = userInfo.homedir.replace(/\\/g, '/')
  try {
    let result = getPathInfo(pathName)
    let list = ['Music', 'Desktop', 'Documents', 'Downloads', 'Pictures', 'Videos']
    result = result.filter(item => {
      return item.isDirectory && list.includes(item.filename)
    })
    result = result.map(item => {
      item.path = pathName + '/' + item.filename
      return item
    })
    res.json({
      status: true,
      data: result
    })
  } catch (error) {
    res.json({
      status: false,
      msg: '获取失败'
    })
  }
})
router.get('/getDisk', (req, res, next) => {
  try {
    exec('wmic logicaldisk get caption', { windowsHide: true }, (err, stdout, stderr) => {
      if (err || stderr) {
        console.log('root path open failed' + err + stderr)
        return
      }
      let _disk = stdout.trim().split('\n')
      _disk.shift()
      let _result = []
      _disk.forEach(item => {
        _result.push(item.replace(/\s/g, ''))
      })
      res.json({
        status: true,
        data: _result
      })
    })
  } catch (error) {
    res.json({
      status: false,
      msg: '获取磁盘盘符失败'
    })
  }
})
router.get('/encry', (req, res, next) => {
  let { path, filename, ks, id } = req.query
  encryptFile(path, filename, ks, id).then(data => {
    res.json({
      status: true,
      msg: '加密成功',
      data: data
    })
  }).catch(err => {
    res.json({
      status: false,
      msg: err
    })
  })
})
router.get('/decry', (req, res, next) => {
  let _path = req.query.path
  let _file = req.query.filename
  let key = req.query.kd
  // let id = md5(UUID.v1())
  // console.log('11', _path, _file, id)
  decryptFile(_path, _file, key).then(data => {
    res.json({
      status: true,
      msg: '解密成功',
      data: data
    })
  }).catch(err => {
    res.json({
      status: false,
      msg: err
    })
  })
})
// 文本或者参数加解密
router.post('/enOrDecrypted', urlencodedParser, function (req, res) {
  debugger
  let isDecrypted = req.body.decrypted
  let content = req.body.content
  let ks = req.body.ks
  if (!content) {
    res.json({
      status: false,
      msg: '缺少参数'
    })
    return
  }
  getSecretText(content, isDecrypted, ks).then(result => {
    res.json({
      status: true,
      msg: '加/解密成功',
      data: result
    })
  }).catch((err) => {
    res.json({
      status: false,
      msg: err
    })
  })
})
// 获取登录参数
router.get('/getLoginPara', function (req, res) {
  getParams().then(result => {
    res.json(result)
  }).catch((err) => {
    res.json({
      status: false,
      msg: err
    })
  })
})
// 分片加密
router.get('/burst', (req, res) => {
  burstFile(req.query).then(result => {
    res.json({
      status: result.status,
      msg: result.msg
    })
  }).catch(err => {
    res.json({
      status: false,
      msg: err
    })
  })
})
// 或者文件id
router.post('/getFileId', urlencodedParser, function (req, res) {
  let content = req.body.content
  let name = req.body.name
  if (!content) {
    res.json({
      status: false,
      msg: '缺少参数'
    })
    return
  }
  getFileId(content, name).then(result => {
    console.log('result', result)
    res.json({
      status: true,
      msg: '获取fileId成功',
      data: result
    })
  }).catch((err) => {
    res.json({
      status: false,
      msg: err
    })
  })
})

export default router

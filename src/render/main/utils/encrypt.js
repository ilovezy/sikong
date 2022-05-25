const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const getMac = require('getmac').default
/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
var AESConf = {
  key: '54F0853FD5D8D2FD61CE33309B0D0273', // 密钥
  iv: 'A19820BCE43576DF', // 偏移向量
  padding: 'PKCS7Padding' // 补全值
}

// 解密
function decrypted (data, ks) {
  let key = AESConf.key
  if (ks) {
    key = ks
  }
  let iv = AESConf.iv
  var cipherChunks = []
  var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  decipher.setAutoPadding(true)
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'))
  cipherChunks.push(decipher.final('utf8'))
  return cipherChunks.join('')
}
// 加密
function encrypted (data, ks) {
  let key = AESConf.key
  if (ks) {
    key = ks
  }
  let iv = AESConf.iv
  var cipherChunks = []

  var cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

  cipherChunks.push(cipher.update(data, 'utf8', 'base64'))
  cipherChunks.push(cipher.final('base64'))
  return cipherChunks.join('')
}
// 单文本或者参数加解密
async function getSecretText (content, flag, ks) {
  let result = ''
  if (flag === '1') { // 是解密
    console.log('ks:', ks)
    result = decrypted(content, ks)
  } else {
  // console.log('enOrDecrypted:', content, typeof(content))
  // let result = encrypted('{"phone":"13876524390"}')
    result = encrypted(content, ks)
    console.log(result)
  }
  return result
}
// 文件加密
function encryptFile (filepath, filename, fileId, ks) {
  return new Promise(function (resolve, reject) {
    let key = AESConf.key
    if (ks) {
      key = ks
    }
    let iv = AESConf.iv
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    var input = fs.createReadStream(filepath)
    let enPath = path.join('static', 'file', filename)
    var output = fs.createWriteStream(enPath)
    input.pipe(cipher).pipe(output)
    output.on('finish', function () {
      writeFileToLine(enPath, fileId)
      resolve(enPath)
      console.log('Encrypted file written to disk！')
    })
  })
}
// 文件解密
function decryptFile (path, ks) {
  let key = AESConf.key
  if (ks) {
    key = ks
  }
  let iv = AESConf.iv
  let buff = fs.readFile(path)
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return decipher.update(buff, 'hex')
}
// 往固定的行写入数据
function writeFileToLine (path, value) {
  let data = fs.readFile(path, 'utf8').split(/\r\n|\n|\r/gm)
  data.splice(0, 0, value)
  fs.writeFile(path, data.join('\r\n'))
}
async function getParams () {
  // 获取机器mac地址
  let mac = getMac()
  console.log('mac:', mac)
  let token = encrypted(mac)
  return {
    status: true,
    msg: '获取成功',
    data: {
      mac: mac,
      token: token
    }
  }
}
function existsFile (path) {
  if (fs.existsSync(path)) {
    return true
  } else {
    return false
  }
}
function getFileId (enPath, filename) {
  return new Promise(function (resolve, reject) {
    let data = ''
    // let _path = path.join(enPath, filename)
    // 创建可读流
    var readerStream = fs.createReadStream(enPath)
    // 设置编码为 utf8。
    readerStream.setEncoding('UTF8')
    // 处理流事件 --> data, end, and error
    readerStream.on('data', function (chunk) {
      data += chunk
    })
    readerStream.on('end', function () {
      // console.log(data)
      let isSecret = data.substring(0, 8) === 'JeOW0ix7'
      let _key = data.substring(8, 40)
      /* resolve({
        fileId: _key,
        isSecret: isSecret
      }) */
      let _newPath = ''
      if (isSecret) {
        _newPath = enPath.replace(/(\([1-9][0-9]{0,1}\)){0,1}.wymc/g, '')
      } else {
        _newPath = enPath + '.wymc'
      }
      // console.log('name111---', filename)
      let isExist = existsFile(_newPath)
      console.log('res111---', isExist)
      resolve({
        fileId: _key,
        isSecret: isSecret,
        isExist: isExist
      })
      // console.log(_key)
      // data = data.substring(40, data.length)
    })
  })
}
export {
  decrypted,
  encrypted,
  getSecretText,
  encryptFile,
  decryptFile,
  getFileId,
  getParams
}

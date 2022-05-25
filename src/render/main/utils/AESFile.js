import { getType } from './util'
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
// let key = 'JeOW0ix72950E50896364E2065BAA48E45E4FD86'
// let iv = 'A19820BCE43576DF'
// eslint-disable-next-line camelcase
var AES_conf = {
  key: '54F0853FD5D8D2FD61CE33309B0D0273', // 密钥
  iv: 'A19820BCE43576DF', // 偏移向量
  padding: 'PKCS7Padding', // 补全值
  code: 'JeOW0ix7'
}
function aesEncryptNew (buff, key, iv, typeObj) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  cipher.setAutoPadding(true)
  let crypted = cipher.update(buff, '', 'hex')
  if (!typeObj.isImg) {
    crypted += cipher.final('hex')
  }
  return crypted
}
function aesDecryptNew (buff, key, iv) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  decipher.setAutoPadding(false)
  return decipher.update(buff, 'hex', '')
}

function encryptFile (filepath, filename, fileId, ks) {
  return new Promise(function (resolve, reject) {
    let key = AES_conf.key
    if (ks) {
      key = ks
    }
    let iv = AES_conf.iv
    let code = AES_conf.code + fileId
    let _path = path.join(filepath, filename)
    let buff = fs.readFileSync(_path)
    let buffEnc = aesEncryptNew(buff, key, iv)
    // console.log(buffEnc)
    let _newPath = _path + '.wymc'
    // fs.writeFileSync(_newPath, Buffer.from(buffEnc, 'hex'))
    // 创建一个可以写入的流，写入到文件 output.txt 中
    var writerStream = fs.createWriteStream(_newPath)
    // 使用 utf8 编码写入数据
    writerStream.write(code, 'utf8')
    writerStream.write(Buffer.from(buffEnc, 'hex'), 'hex')
    // 标记文件末尾
    writerStream.end()

    // 处理流事件 --> data, end, and error
    writerStream.on('finish', function () {
      console.log('写入完成。')
      resolve(_newPath)
    })
    writerStream.on('error', function (err) {
      reject(err)
    })
  })
}

function decryptFile (filepath, filename, ks) {
  return new Promise(function (resolve, reject) {
    let key = AES_conf.key
    if (ks) {
      key = ks
    }
    let iv = AES_conf.iv
    let _path = path.join(filepath, filename)
    let hexContent = fs.readFileSync(_path)
    let bufferFile = hexContent.slice(40, hexContent.length)
    let deHex = aesDecryptNew(bufferFile, key, iv)
    let _newPath = _path.replace(/(\([1-9][0-9]{0,1}\)){0,1}.wymc/g, '')
    fs.writeFileSync(_newPath, Buffer.from(deHex, 'hex'))
    resolve(_newPath)
  })
}

function burstFile (query) {
  return new Promise((resolve, reject) => {
    let { start, end, filepath, filename, index, ks, cryType, fileId, total } = query
    let _path = path.join(filepath, filename)
    if (!fs.existsSync(_path)) {
      resolve({
        status: false,
        msg: '文件已移动或已删除'
      })
      return
    }
    let buff = fs.readFileSync(_path)
    if (cryType === 'decry') { // 如果解密,去掉前面40位头信息
      buff = buff.slice(40)
    }
    let bufferFile = buff.slice(start, end)
    let typeObj = getType(filename)
    try {
      encryptBurstFile(bufferFile, _path, ks, cryType, index, fileId, typeObj, total)
      resolve({
        status: true,
        msg: `第${index}分片${cryType}成功`
      })
    } catch (error) {
      reject(error)
    }
  })
}
function encryptBurstFile (buff, _path, ks, cryType, index, fileId, typeObj, total) {
  let key = AES_conf.key
  if (ks) {
    key = ks
  }
  let iv = AES_conf.iv
  let buffEnc = cryType === 'encry' ? aesEncryptNew(buff, key, iv, typeObj) : aesDecryptNew(buff, key, iv)
  let _newPath = ''
  if (cryType === 'encry') {
    _newPath = _path + '.wymc'
    if (index === '0') { // 如果是加密的第一个分片，需要加上头信息code
      let code = AES_conf.code + fileId
      //加密的第一个分片 不能用append 方式写入，如果已经存在的话就会越写越大
      // fs.appendFileSync(_newPath, code, 'utf8')
      fs.writeFileSync(_newPath,code, 'utf8')
    }
    fs.appendFileSync(_newPath, Buffer.from(buffEnc, 'hex'))
  } else {
    // 解密时每个分片都多加了16字节补位，所以需要去掉
    // 如果是解密的最后一个分片，则补全值可能不为16，需要判断是否有补全值，去掉该补全值
    let _pad = 16
    if (parseInt(index) === (total - 1)) {
      _pad = buffEnc[buffEnc.length - 1]
    }
    buffEnc = buffEnc.slice(0, buffEnc.length - _pad)
    _newPath = _path.replace(/(\([1-9][0-9]{0,1}\)){0,1}.wymc/g, '')
    if(index === '0'){
      fs.writeFileSync(_newPath,buffEnc)
    }else{
      fs.appendFileSync(_newPath, buffEnc)
    }
   
  }
}

export {
  encryptFile,
  decryptFile,
  burstFile
}

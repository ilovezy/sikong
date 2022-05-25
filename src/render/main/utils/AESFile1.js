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
function aesEncryptNew (buff, key, iv) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  return cipher.update(buff, '', 'hex')
}
function aesDecryptNew (buff, key, iv) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return decipher.update(buff, 'hex')
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
    let _newPath = _path.replace(/.wymc/g, '')
    fs.writeFileSync(_newPath, Buffer.from(deHex, 'hex'))
    resolve(_newPath)
  })
}

export {
  encryptFile,
  decryptFile
}

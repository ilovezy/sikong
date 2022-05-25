import { mkdirsSync } from '../utils/dir'
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
let key = '54F0853FD5D8D2FD61CE33309B0D0273'
let iv = 'A19820BCE43576DF'
const encryUploadPath = path.join(__dirname, 'enCryuploads')
const decryUploadPath = path.join(__dirname, 'deCryuploads')

function aesEncryptNew (buff, key, iv) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let crypted = cipher.update(buff, '', 'hex')
  crypted += cipher.final('hex')
  return crypted
}
function aesDecryptNew (buff, key, iv) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return decipher.update(buff, 'hex', '')
}

function encryptFile (filepath, filename) {
  let _path = path.join(filepath, filename)
  let buff = fs.readFileSync(_path)
  let buffEnc = aesEncryptNew(buff, key, iv)
  console.log(buffEnc)
  let _newPath = _path + '.wymc'
  var writerStream = fs.createWriteStream(_newPath)
  writerStream.write(key, 'utf8')
  writerStream.write(Buffer.from(buffEnc, 'hex'), 'hex')
  writerStream.end()
  writerStream.on('finish', function () {
    console.log('写入完成。')
  })
}

function decryptFile (filepath, filename) {
  let _path = path.join(filepath, filename)
  let hexContent = fs.readFileSync(_path)
  // let bufferFile = hexContent.slice(32, hexContent.length)
  let deHex = aesDecryptNew(hexContent, key, iv)
  let _newPath = _path.replace(/.wymc/g, '')
  fs.writeFileSync(_newPath, Buffer.from(deHex, 'hex'))
}

function burstFile (query) {
  return new Promise((resolve, reject) => {
    const { start, end, filepath, filename, ks, cryType } = query
    let uploadPath = cryType === 'encry' ? encryUploadPath : decryUploadPath
    if (!fs.existsSync(uploadPath)) mkdirsSync(uploadPath)
    let _path = path.join(filepath, filename)
    let buff = fs.readFileSync(_path)
    // if (cryType === 'decry') {
    //   buff = buff.slice(32)
    // }
    let bufferFile = buff.slice(start, end)
    encryptBurstFile(bufferFile, _path, ks, cryType).then(_ => {
      resolve()
    }).catch(err => {
      console.log('err', err)
      reject(err)
    })
  })
}
function encryptBurstFile (buff, _path, ks, cryType) {
  return new Promise(function (resolve, reject) {
    let buffEnc = cryType === 'encry' ? aesEncryptNew(buff, key, iv) : aesDecryptNew(buff, key, iv)
    // let uploadPath = cryType === 'encry' ? encryUploadPath : decryUploadPath
    let _newPath = ''
    if (cryType === 'encry') {
      _newPath = _path + '.wymc'
      fs.appendFileSync(_newPath, Buffer.from(buffEnc, 'hex'))
    } else {
      _newPath = _path.replace(/.wymc/g, '')
      fs.appendFileSync(_newPath, buffEnc)
    }
    resolve(_newPath)
    // let _newPath = uploadPath + '/' + index + '.wymc'
    // let writerStream = fs.createWriteStream(_newPath)
    // writerStream.write(Buffer.from(buffEnc, 'hex'), 'hex')
    // writerStream.end()
    // writerStream.on('finish', function () {
    //   resolve(_newPath)
    // })
    // writerStream.on('error', function (err) {
    //   reject(err)
    // })
  })
}
function mergeFile (filepath, filename, fileId, cryType) {
  return new Promise(function (resolve, reject) {
    let _path = path.join(filepath, filename)
    let _newPath = ''
    if (cryType === 'encry') {
      _newPath = _path + '.wymc'
    } else {
      _newPath = _path.replace(/.wymc/g, '')
    }
    var writerStream = fs.createWriteStream(_newPath, { 'flags': 'a' })
    if (cryType === 'encry') {
      // writerStream.write(code, 'utf8')
    }
    // 读取所有的chunks 文件名存放在数组中
    let uploadPath = cryType === 'encry' ? encryUploadPath : decryUploadPath
    let chunks = fs.readdirSync(uploadPath)
    let _len = chunks.length
    for (let i = 0; i < _len; i++) {
      let _file = uploadPath + '/' + i + '.wymc'
      let buffEnc = fs.readFileSync(_file)
      writerStream.write(buffEnc)
      fs.unlinkSync(_file)
    }
    writerStream.end()
    fs.rmdirSync(uploadPath)
    writerStream.on('finish', function () {
      resolve(_newPath)
    })
    writerStream.on('error', function (err) {
      reject(err)
    })
  })
}

export {
  encryptFile,
  decryptFile,
  burstFile,
  mergeFile
}

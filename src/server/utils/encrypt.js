const crypto = require('crypto');
const config = require('./config')
const path = require('path');
const fs = require('fs');
import {app} from 'electron'
import {getType} from './utilfn.js'

const apppath = app.getPath('userData') // 获取electron应用的用户目录
/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
const AES_conf = {
  key: config.publicKey, //密钥
  iv: 'A19820BCE43576DF', //偏移向量
  padding: 'PKCS7Padding' //补全值
}

// 文件加密
function aesEncryptNew(buff, key, iv, typeObj) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  cipher.setAutoPadding(true)
  let crypted = cipher.update(buff, '', 'hex')
  if (!typeObj.isImg) {
    crypted += cipher.final('hex')
  }
  return crypted
}

function encryptFile(filepath, filename, fileId, ks) {
  return new Promise(function (resolve, nay) {
    let key = AES_conf.key;
    if (ks) {
      key = ks
    }
    let iv = AES_conf.iv;
    let typeObj = getType(filename)
    let buff = fs.readFileSync(filepath)
    let buffEnc = aesEncryptNew(buff, key, iv, typeObj)
    let enPath = path.join(apppath, filename)
    console.log("path:", enPath, filepath)
    // 创建一个可以写入的流，写入到文件 output.txt 中
    const writerStream = fs.createWriteStream(enPath)

    // 使用 utf8 编码写入数据
    writerStream.write(fileId, 'utf8')
    writerStream.write(Buffer.from(buffEnc, 'hex'), 'hex')
    // 标记文件末尾
    writerStream.end()
    // 处理流事件 --> data, end, and error
    writerStream.on('finish', function () {
      console.log('写入完成。')
      resolve({
        path: enPath,
        fileId: fileId.substring(8)
      })
    })
  });
}

// 文件加密批量
function encryptFileAll(fileList, code) {
  return new Promise(function (resolve, nay) {
    const ans = [];
    fileList.map(item => {
      let fileId = code + item.fileId
      let args = [item.path, item.filename, fileId, item.kd]
      ans.push(encryptFile.apply(null, args));
    })
    Promise.all(ans).then(resolve);
  });
}

// 文件解密
function aesDecryptNew(buff, key, iv) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  decipher.setAutoPadding(false)
  return decipher.update(buff, 'hex')
}

function getFileId(filename) {
  return new Promise(function (resolve, nay) {
    // let enPath = path.join('./resources','file', filename)
    let enPath = path.join(apppath, filename)
    // let enPath = path.join('./', filename)
    let data = ''
    // 创建可读流
    const readerStream = fs.createReadStream(enPath)
    // 设置编码为 utf8。
    readerStream.setEncoding('utf-8')
    // 处理流事件 --> data, end, and error
    readerStream.on('data', function (chunk) {
      data += chunk
    })
    readerStream.on('end', function () {
      let _key = data.substring(8, 40)
      resolve({
        fileId: _key,
      })
    })
  });
}

// 文件解密
function decryptFile(filename, ks) {
  return new Promise(function (resolve, nay) {
    let key = AES_conf.key;
    if (ks) {
      key = ks
    }
    let iv = AES_conf.iv;
    let _path = path.join(apppath, filename)
    let hexContent = fs.readFileSync(_path)
    let bufferFile = hexContent.slice(40, hexContent.length)
    let deHex = aesDecryptNew(bufferFile, key, iv)
    console.log('_path--', _path)
    let _pad = deHex[deHex.length - 1]
    deHex = deHex.slice(0, deHex.length - _pad)
    let _newPath = path.join(apppath, '' + filename)
    fs.writeFileSync(_newPath, Buffer.from(deHex, 'hex'))
    resolve({
      path: _newPath
    })
  })
}

export {
  encryptFileAll,
  decryptFile,
  getFileId,
}

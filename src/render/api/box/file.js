
import {
  ajax
} from '@/utils'
var qs = require('qs')

// 获取文件的fileId
export const getFileIdApi = (params = {}) => ajax({
  url: 'getFileId',
  method: 'post',
  data: qs.stringify(params)
})
// 文件解密
export const decryptedFileApi = (params = {}) => ajax({
  url: 'decryptedFile',
  method: 'post',
  data: qs.stringify(params)
})

// 获取加解密结果
export const enOrDecryptedApi = (params = {}) => ajax({
  url: 'enOrDecrypted',
  method: 'post',
  data: qs.stringify(params)
})

// 截屏保存本地
export const uploadSendApi = (params = {}) => ajax({
  url: 'uploadSend',
  method: 'post',
  data: qs.stringify(params)
})

// 附件另存为
export const saveAsFileApi = (params = {}) => ajax({
  url: 'saveAsFile',
  method: 'post',
  data: qs.stringify(params)
})

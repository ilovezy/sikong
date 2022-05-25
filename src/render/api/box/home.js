import { ajax } from '@/utils'
// 获取目录下文件
export const getPathInfoApi = (params = {}) => ajax({
  url: 'getPathInfo',
  params: params
})
// 获取电脑盘符
export const getDiskApi = () => ajax({
  url: 'getDisk'
})
// 加密
export const enCryFileApi = (params = {}) => ajax({
  url: 'encry',
  params: params
})
// 解密
export const deCryFileApi = (params = {}) => ajax({
  url: 'decry',
  params: params
})
// 分片上传
export const burstFileApi = (params = {}) => ajax({
  url: 'burst',
  params: params
})
// 获取左侧用户下的类型
export const getUserFolderApi = () => ajax({
  url: 'getUserFolder'
})

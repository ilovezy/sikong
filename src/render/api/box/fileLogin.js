import {
  ajax,
  javaAjax
} from '@/utils'
import {post} from "@/plugins/axios"

// 这四个登录的接口，已经不用了
// 获取登录信息
export const checkLoginApi = (params = {}) => javaAjax({
  url: 'qrcode/v2/pc/checkLogin',
  method: 'get',
  params: params
})

// 获取mac及token
export const getLoginParaApi = () => ajax({
  url: 'getLoginPara',
  method: 'get'
})
// 发起登录请求
export const noticeLoginApi = (params = {}) => javaAjax({
  url: 'qrcode/v2/pc/noticeLogin',
  method: 'post',
  params: params
})
// 检测登录状态
export const checkStateApi = (params = {}) => javaAjax({
  url: 'qrcode/v2/pc/checkState',
  method: 'post',
  params: params
})
// 这四个登录的接口，已经不用了


// 获取加密密钥
export const getSecretKeyApi = (data) => post('/dataKey/requireKd', data)

// 上报密钥关系
export const submitFileKdRelationApi = (data) => post('/dataKey/submitFileKdRelation', data)

// 获取解密密钥
export const requireKdByFileIdApi = (data) => post('/dataKey/requireKdByFileId', data)

// 获取解密密钥 批量
export const requireKdsByFileIdsApi = (data) => post('/dataKey/requireKdsByFileIds', data)

// 获取通讯录列表
export const getContactListApi = (data) => post('/addressBook/v2/getAddressBookList', data)

// 添加通讯录
export const addressBookApi = (data) => post('/addressBook/v2/addAddressBook', data)

// 修改通讯录
export const updateAddressBookApi = (data) => post('/addressBook/v2/updateAddressBook', data)

// 删除通讯录
export const deleteAddressBookApi = (data) => post('/addressBook/v2/deleteAddressBook', data)

// 完全控制
export const addReceiversApi = (data) => post('/expand/addReceivers', data)

export const listReceiversApi = (data) => post('/expand/listReceivers', data)


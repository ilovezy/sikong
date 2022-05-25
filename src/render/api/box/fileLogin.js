import {
  ajax,
  javaAjax
} from '@/utils'
import {post} from "@/plugins/axios"

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
// 获取加密密钥
// export const getSecretKeyApi = (params = {}) => javaAjax({
//   url: 'dataKey/requireKd',
//   method: 'post',
//   params: params
// })
export const getSecretKeyApi = (data) => post('/dataKey/requireKd', data)


// 上报密钥关系
export const submitFileKdRelationApi = (params = {}) => javaAjax({
  url: 'dataKey/submitFileKdRelation',
  method: 'post',
  params: params
})

// 获取解密密钥
export const requireKdByFileIdApi = (params = {}) => javaAjax({
  url: 'dataKey/requireKdByFileId',
  method: 'post',
  params: params
})
// 获取解密密钥 批量
export const requireKdsByFileIdsApi = (params = {}) => javaAjax({
  url: 'dataKey/requireKdsByFileIds',
  method: 'post',
  params: params
})
// 获取通讯录列表
export const getContactListApi = (params = {}) => javaAjax({
  url: 'addressBook/v2/getAddressBookList',
  method: 'post',
  params: params
})
// 添加通讯录
export const addressBookApi = (params = {}) => javaAjax({
  url: 'addressBook/v2/addAddressBook',
  method: 'post',
  params: params
})
// 修改通讯录
export const updateAddressBookApi = (params = {}) => javaAjax({
  url: 'addressBook/v2/updateAddressBook',
  method: 'post',
  params: params
})
// 删除通讯录
export const deleteAddressBookApi = (params = {}) => javaAjax({
  url: 'addressBook/v2/deleteAddressBook',
  method: 'post',
  params: params
})
// 完全控制
export const addReceiversApi = (params = {}) => javaAjax({
  url: 'expand/addReceivers',
  method: 'post',
  params: params
})
export const listReceiversApi = (params = {}) => javaAjax({
  url: 'expand/listReceivers',
  method: 'post',
  params: params
})

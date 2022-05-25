import request from "@/plugins/axios"

// 查询扫码状态
export const inquireLoginState = (data) => request.get('/qrcode/v2/pc/inquireLoginState', {
  params: {...data}
})

// 查询登录信息
export const checkLogin = (data) => request.get('/qrcode/v2/pc/checkLogin', {
  params: {...data, timeStamp: new Date().getTime()}
})

export const cancelLogin = (data) => request.get('/qrcode/v2/pc/pcCancelLogin', {
  params: {...data}
})

// 检测登录状态，展示登录按钮之前触发
export const checkState = (params) => request.post('qrcode/v2/pc/checkState', params)

// 发起登录请求
export const login = (params) => request.post('qrcode/v2/pc/noticeLogin', params)
export const changeNickName = (nickname) => request.post('/user/v2/updateSelfNickName', {nickname})

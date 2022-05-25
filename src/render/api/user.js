import {post} from "@/plugins/axios"

// 修改用户信息
export const modifyUserInfo = (data) => post('/user/v2/updateSelfNickName', data)
// 搜用户
export const findUserByPhoneOrEmail = (data) => post('/user/v2/findMailUserByPhoneOrMail', data)

"use strict";

import axios from "axios";
import router from '@/router'
import {Message} from 'element-ui'
import {decrypted, encrypted} from "/src/utils/encrypt"
import store from "@/store"
// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
    baseURL: process.env.VUE_APP_BASE_URL || process.env.BASE_URL || "",
    timeout: 60 * 1000, // Timeout
    withCredentials: true, // Check cross-site Access-Control
};
const whiteList = [
    'qrcode/v2/pc/inquireLoginState',
    // 这一批都是老的文件接口
    '/dataKey/requireKd',
    '/dataKey/submitFileKdRelation',
    '/dataKey/requireKdByFileId',
    '/dataKey/requireKdsByFileIds',
    '/addressBook/v2/getAddressBookList',
    '/addressBook/v2/addAddressBook',
    '/addressBook/v2/updateAddressBook',
    '/addressBook/v2/deleteAddressBook',
    '/expand/addReceivers',
    '/expand/listReceivers',
    // 这一批都是老的文件接口
]
const request = axios.create(config);

request.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const token = store.getters.token
        if (token) {
            config.headers['Authorization'] = token;
        }
        // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
request.interceptors.response.use(
    function (response) {
        // Do something with response data
        const code = response.data.code
        if (code !== '00') {
            const msg = errCode[code]
            if (code === '18') {
                store.dispatch('FedLogOut')
                router.replace('/login');
            }
            return Promise.reject(msg ? msg : '未知错误，清稍后再试')
        }
        const path = response.config.url.substring(response.config.baseURL.length)
        let data = response.data.data
        console.log(`返回密文: ${data}`)
        if (data && !isWhitePath(path)) {
            let ks = store.getters.ks;
            data = JSON.parse(decrypted(data, ks))
            console.log(`返回原文: ${JSON.stringify(data, null, 2)}`)
            if (data.ks && data.ksId) {
                store.commit('SET_KS', {ksId: data.ksId, ks: data.ks});
            }
        }
        return Promise.resolve({code, data})
    },
    function (error) {
        // Do something with response error
        Message.error({
            message: '请求失败，请稍后重试',
            center: true
        });
        return Promise.reject(error);
    }
);

function isWhitePath(path) {
    for (let whitePath of whiteList) {
        if (path.endsWith(whitePath)) {
            return true
        }
    }
    return false
}

export const post = (url, data) => {
    const params = getContent(data)
    return request({
        url, method: 'post', params: params
    })
}

export const get = (url, params) => {
    const value = getContent(params)
    return request.get(url, {params: value})
}

function getContent(data) {
    const ksId = parseInt(store.getters.ksId)
    const ks = store.getters.ks
    const jsonStr = JSON.stringify(data)
    console.log(`请求原文: ${jsonStr}`)
    const content = encrypted(jsonStr, ks)
    console.log(`请求密文：${content}`)
    return {ksId, content}
}

const errCode = {
    "01": "手机号位空或者格式错误",
    "02": "App类型错误",
    "03": "ksId 不存在",
    "04": "客户端与服务器ks不同步(不同步后需要走重新登录流程)",
    "05": "Ks0 解密失败",
    "06": "ks 解密失败",
    "07": "Kd 与 文件关联失败",
    "08": "量子密钥生成失败",
    "09": "无解密权限",
    "10": "邮件id错误",
    "11": "ksId 非法",
    "12": "接收方信息错误",
    "13": "变更接收方权限错误",
    "14": "请求参数错误",
    "15": "登录错误-手机不匹配",
    "16": "登录错误-mac不匹配",
    "17": "登录错误-长时间未登录，需扫描二维码",
    "18": "token非法",
    "19": "超级管理员不匹配",
    "100": "系统内部错误",
}
export default request;

import axios from 'axios'
// import config from '../../../config/config'

export const nodeUrl = 'http://localhost:3618/'
console.log(nodeUrl)
export async function ajax (options) {
  let config = {
    withCredentials: true,
    baseURL: nodeUrl,
    timeout: 15000,
    url: options.url,
    method: options.method || 'get',
    params: options.params || {},
    data: options.data || {},
    headers: options.headers || { 'Content-Type': 'application/x-www-form-urlencoded' }
  }
  return axios(config).catch(e => {
    console.log(e)
  })
}
export function javaAjax (options) {
  let config = {
    withCredentials: true,
    // baseURL: 'http://113.57.175.69:61010',
    baseURL: 'http://114.80.222.225:1111',
    // baseURL: 'api',
    timeout: 15000,
    url: options.url,
    method: options.method || 'get',
    params: options.params || {},
    data: options.data || {},
    headers: options.headers || { 'Content-Type': 'application/x-www-form-urlencoded' }
  }
  return axios(config).catch(e => {})
}

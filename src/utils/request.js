import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import message from 'ant-design-vue/es/message'
import { VueAxios } from './axios'
import { isObject } from './util'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 站点配置文件
// window.publicConfig => public/config.js
const publicConfig = store.getters.publicConfig;

// 创建 axios 实例
const service = axios.create({
  // 服务端api地址
  // baseURL: process.env.NODE_ENV === 'production' ? publicConfig.BASE_API : process.env.VUE_APP_API_BASE_URL,
  baseURL: publicConfig.BASE_API,
  timeout: 25 * 1000 // 请求超时时间，25秒, 如果上传大文件需要更长
})

// 接口请求拦截
service.interceptors.request.use(config => {
  // 设置每个请求的Content-Type
  // config.headers['Content-Type'] = 'application/json;charset=utf-8'

  // 让每个请求携带当前用户token
  const token = storage.get(ACCESS_TOKEN)
  if (token) {
    config.headers['Access-Token'] = token
  }
  return config
})

// 接口响应拦截
service.interceptors.response.use((response) => {
  const result = response.data
  if (!isObject(result)) {
    const error = { message: '服务端api返回的数据格式不正确' }
    return Promise.reject(error)
  }
  // result.status [ 200正常 500有错误 401未登录 403没有权限访问 ]
  // api报错信息
  if (result.status === 500) {
    message.error(result.message, 1.8)
    return Promise.reject(result)
  }
  // 鉴权失败: 未登录
  if (result.status === 401) {
    store.dispatch('Logout').then(() => {
      notification.error({
        message: '错误',
        description: result.message,
        duration: 3
      })
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    })
    return Promise.reject(result)
  }
  return result
}, (error) => {
  // 网络请求出错
  const errMsg = ((error.response || {}).data || {}).message || '请求出现错误，请稍后再试'
  notification.error({
    message: '网络请求出错',
    description: errMsg,
    duration: 3
  })
  return Promise.reject(error)
})

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}

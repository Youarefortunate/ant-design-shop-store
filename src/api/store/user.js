import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  info: '/store.user/info',
  list: '/store.user/list',
  add: '/store.user/add',
  edit: '/store.user/edit',
  delete: '/store.user/delete',
  renew: '/store.user/renew'
}

/**
 * 获取当前登录的用户信息
 */
export function getInfo () {
  return axios({
    url: api.info,
    method: 'get'
  })
}

/**
 * 更新当前管理员信息
 * @param {*} data
 */
export function renew (data) {
  return axios({
    url: api.renew,
    method: 'post',
    data
  })
}

/**
 * 管理员列表
 */
export function list (params) {
  return axios({
    url: api.list,
    method: 'get',
    params
  })
}

/**
 * 新增记录
 * @param {*} data
 */
export function add (data) {
  return axios({
    url: api.add,
    method: 'post',
    data
  })
}

/**
 * 编辑记录
 * @param {*} data
 */
export function edit (data) {
  return axios({
    url: api.edit,
    method: 'post',
    data
  })
}

/**
 * 删除记录
 * @param {*} data
 */
export function deleted (data) {
  return axios({
    url: api.delete,
    method: 'post',
    data: data
  })
}

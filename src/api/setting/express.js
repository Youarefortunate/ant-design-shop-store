import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  list: '/setting.express/list',
  all: '/setting.express/all',
  add: '/setting.express/add',
  edit: '/setting.express/edit',
  delete: '/setting.express/delete'
}

/**
 * 列表记录
 */
export function list (params) {
  return axios({
    url: api.list,
    method: 'get',
    params
  })
}

/**
 * 全部记录
 */
export function all (params) {
  return axios({
    url: api.all,
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

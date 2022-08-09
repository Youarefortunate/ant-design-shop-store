import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  list: '/files/list',
  edit: '/files/edit',
  delete: '/files/delete',
  moveGroup: '/files/moveGroup'
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

/**
 * 移动分组
 * @param {*} data
 */
export function moveGroup (data) {
  return axios({
    url: api.moveGroup,
    method: 'post',
    data: data
  })
}

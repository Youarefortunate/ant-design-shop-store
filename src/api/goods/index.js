import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  list: '/goods/list',
  listByIds: '/goods/listByIds',
  detail: '/goods/detail',
  basic: '/goods/basic',
  add: '/goods/add',
  edit: '/goods/edit',
  delete: '/goods/delete',
  state: '/goods/state'
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
 * 根据商品ID集获取列表记录
 */
export function listByIds (goodsIds, params) {
  return axios({
    url: api.listByIds,
    method: 'get',
    params: { goodsIds, ...params }
  })
}

/**
 * 商品详情(详细信息)
 */
export function detail (params) {
  return axios({
    url: api.detail,
    method: 'get',
    params
  })
}

/**
 * 商品详情(基础信息)
 */
export function basic (goodsId, params) {
  return axios({
    url: api.basic,
    method: 'get',
    params: { goodsId, ...params }
  })
}

/**
 * 更新状态
 * @param {*} data
 */
export function state (data) {
  return axios({
    url: api.state,
    method: 'post',
    data
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

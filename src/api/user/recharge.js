import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  order: '/user.recharge/order'
}

/**
 * 列表记录
 */
export function order (params) {
  return axios({
    url: api.order,
    method: 'get',
    params
  })
}

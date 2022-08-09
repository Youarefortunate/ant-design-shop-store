import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  log: '/market.points/log'
}

/**
 * 积分明细
 */
export function log (params) {
  return axios({
    url: api.log,
    method: 'get',
    params
  })
}

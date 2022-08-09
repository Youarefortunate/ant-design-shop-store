import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  log: '/user.balance/log'
}

/**
 * 列表记录
 */
export function log (params) {
  return axios({
    url: api.log,
    method: 'get',
    params
  })
}

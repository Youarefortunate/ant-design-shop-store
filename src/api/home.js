import { axios } from '@/utils/request'

const api = {
  data: '/home/data'
}

/**
 * 后台首页
 * @param {*} params
 */
export function data (params) {
  return axios({
    url: api.data,
    method: 'get',
    params
  })
}

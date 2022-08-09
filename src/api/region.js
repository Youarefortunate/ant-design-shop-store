import { axios } from '@/utils/request'

const api = {
  all: '/region/all',
  tree: '/region/tree'
}

/**
 * 获取所有地区
 */
export function all (params) {
  return axios({
    url: api.all,
    method: 'get',
    params
  })
}

/**
 * 获取所有地区(树状)
 */
export function tree (params) {
  return axios({
    url: api.tree,
    method: 'get',
    params
  })
}

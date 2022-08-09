import { axios } from '@/utils/request'

const api = {
  data: '/statistics.data/data',
  survey: '/statistics.data/survey'
}

/**
 * 数据统计主页
 * @param {*} params
 */
export function data (params) {
  return axios({
    url: api.data,
    method: 'get',
    params
  })
}

/**
 * 数据概况
 * @param {*} params
 */
export function survey (params) {
  return axios({
    url: api.survey,
    method: 'get',
    params
  })
}

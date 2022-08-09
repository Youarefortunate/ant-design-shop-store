import { axios } from '@/utils/request'

/**
 * api接口列表
 */
const api = {
  exportOrder: '/order.export/exportOrder',
  list: '/order.export/list'
}

// 订单导出
export function exportOrder (params) {
  return axios({
    url: api.exportOrder,
    method: 'get',
    params
  })
}

// 获取订单导出记录
export function list (params) {
  return axios({
    url: api.list,
    method: 'get',
    params
  })
}

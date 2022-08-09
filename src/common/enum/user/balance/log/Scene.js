import Enum from '../../../enum'

/**
 * 枚举类：余额变动场景
 * PayStatusEnum
 */
export default new Enum([
  { key: 'RECHARGE', name: '用户充值', value: 10 },
  { key: 'CONSUME', name: '用户消费', value: 20 },
  { key: 'ADMIN', name: '管理员操作', value: 30 },
  { key: 'REFUND', name: '订单退款', value: 40 },
])

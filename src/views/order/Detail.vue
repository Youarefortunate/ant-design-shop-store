<template>
  <div>
    <!-- 加载中 -->
    <a-spin :spinning="isLoading" />
    <!-- 订单内容 -->
    <div v-if="!isLoading" class="order-content">
      <!-- 订单进度步骤条 -->
      <a-card :bordered="false">
        <div class="order-progress" :class="`progress-${progress}`">
          <ul>
            <li>
              <span>下单时间</span>
              <div class="tip">{{ record.create_time }}</div>
            </li>
            <li>
              <span>付款</span>
              <div
                v-if="record.pay_status == PayStatusEnum.SUCCESS.value"
                class="tip"
              >付款于 {{ record.pay_time }}</div>
            </li>
            <li>
              <span>发货</span>
              <div
                v-if="record.delivery_status == DeliveryStatusEnum.DELIVERED.value"
                class="tip"
              >发货于 {{ record.delivery_time }}</div>
            </li>
            <li>
              <span>收货</span>
              <div
                v-if="record.receipt_status == ReceiptStatusEnum.RECEIVED.value"
                class="tip"
              >收货于 {{ record.receipt_time }}</div>
            </li>
            <li>
              <span>完成</span>
              <div
                v-if="record.order_status == OrderStatusEnum.COMPLETED.value"
                class="tip"
              >完成于 {{ record.receipt_time }}</div>
            </li>
          </ul>
        </div>
      </a-card>

      <!-- 订单信息 -->
      <a-card class="mt-20" :bordered="false">
        <!-- 订单操作 -->
        <template v-if="record.order_status != OrderStatusEnum.CANCELLED.value">
          <div class="ant-descriptions-title">订单操作</div>
          <!-- 提示栏 -->
          <div class="alerts mt-10 mb-15">
            <a-alert
              v-if="record.order_status== OrderStatusEnum.APPLY_CANCEL.value"
              message="当前买家已付款并申请取消订单，请审核是否同意，如同意则自动退回付款金额（原路退款）并关闭订单。"
              banner
            />
          </div>
          <!-- 操作栏 -->
          <div class="actions clearfix mt-10">
            <div class="action-item" v-if="$auth('/order/detail.updatePrice')">
              <a-button
                v-if="record.pay_status == PayStatusEnum.PENDING.value"
                @click="handleUpdatePrice"
              >订单改价</a-button>
            </div>
            <div class="action-item" v-if="$auth('/order/list/all.deliver')">
              <a-button
                v-if="(
                  record.pay_status == PayStatusEnum.SUCCESS.value
                    && record.delivery_type == DeliveryTypeEnum.EXPRESS.value
                    && record.delivery_status == DeliveryStatusEnum.NOT_DELIVERED.value
                    && !inArray(record.order_status, [OrderStatusEnum.CANCELLED.value, OrderStatusEnum.APPLY_CANCEL.value])
                )"
                type="primary"
                @click="handleDelivery"
              >发货</a-button>
            </div>
            <div class="action-item" v-if="$auth('/order/list/all.cancel')">
              <a-button
                v-if="record.order_status == OrderStatusEnum.APPLY_CANCEL.value"
                type="primary"
                @click="handleCancel"
              >审核取消订单</a-button>
            </div>
          </div>
          <a-divider class="o-divider" />
        </template>
        <!-- 订单信息 -->
        <a-descriptions title="订单信息">
          <a-descriptions-item label="订单号">{{ record.order_no }}</a-descriptions-item>
          <a-descriptions-item label="实付款金额">￥{{ record.pay_price }}</a-descriptions-item>
          <a-descriptions-item label="支付方式">
            <a-tag color="green">{{ PayTypeEnum[record.pay_type].name }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="配送方式">
            <a-tag color="green">{{ DeliveryTypeEnum[record.delivery_type].name }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="运费金额">￥{{ record.express_price }}</a-descriptions-item>
          <a-descriptions-item label="订单状态">
            <a-tag
              :color="renderOrderStatusColor(record.order_status)"
            >{{ OrderStatusEnum[record.order_status].name }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="买家信息">
            <a-tooltip>
              <template slot="title">会员ID: {{ record.user.user_id }}</template>
              <span class="c-p">{{ record.user.nick_name }}</span>
            </a-tooltip>
          </a-descriptions-item>
          <a-descriptions-item label="买家留言">
            <strong v-if="record.buyer_remark">{{ record.buyer_remark }}</strong>
            <span v-else>--</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 商品信息 -->
      <a-card class="mt-20" :bordered="false">
        <div class="ant-descriptions-title">订单商品</div>
        <div class="goods-list">
          <a-table
            rowKey="order_goods_id"
            :columns="goodsColumns"
            :dataSource="record.goods"
            :pagination="false"
          >
            <!-- 商品信息 -->
            <template slot="goodsInfo" slot-scope="text, item">
              <GoodsItem
                :data="{
                  image: item.goods_image,
                  imageAlt: '商品图片',
                  title: item.goods_name,
                  goodsProps: item.goods_props
                }"
              />
            </template>
            <!-- 商品编码 -->
            <span slot="goods_no" slot-scope="text">{{ text ? text : '--' }}</span>
            <!-- 单价	 -->
            <template slot="goods_price" slot-scope="text, item">
              <p :class="{ 'f-through': item.is_user_grade }">￥{{ text }}</p>
              <p v-if="item.is_user_grade">
                <a-tooltip>
                  <template slot="title">
                    <span class="f-13">会员等级折扣价</span>
                  </template>
                  <strong>会员价：</strong>
                  <span>￥{{ item.grade_goods_price }}</span>
                </a-tooltip>
              </p>
            </template>
            <!-- 购买数量	 -->
            <span slot="total_num" slot-scope="text">x{{ text }}</span>
            <!-- 商品总价 -->
            <span slot="total_price" slot-scope="text">￥{{ text }}</span>
          </a-table>
          <!-- 订单价格明细 -->
          <div class="order-price">
            <table class="fl-r">
              <tbody>
                <tr>
                  <td>订单总额：</td>
                  <td>￥{{ record.total_price }}</td>
                </tr>
                <tr v-if="record.coupon_money > 0">
                  <td>优惠券抵扣：</td>
                  <td>-￥{{ record.coupon_money }}</td>
                </tr>
                <tr v-if="record.points_money > 0">
                  <td>积分抵扣：</td>
                  <td>-￥{{ record.points_money }}</td>
                </tr>
                <tr v-if="record.update_price.value != 0">
                  <td>商家改价：</td>
                  <td>{{ record.update_price.symbol }}￥{{ record.update_price.value }}</td>
                </tr>
                <tr>
                  <td>运费金额：</td>
                  <td>+￥{{ record.express_price }}</td>
                </tr>
                <tr>
                  <td>实付款金额：</td>
                  <td>
                    <strong>￥{{ record.pay_price }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </a-card>

      <!-- 快递配送 -->
      <a-card
        v-if="record.delivery_type == DeliveryTypeEnum.EXPRESS.value"
        class="mt-20"
        :bordered="false"
      >
        <!-- 收货信息 -->
        <a-descriptions title="收货信息">
          <a-descriptions-item label="收货人姓名">{{ record.address.name }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ record.address.phone }}</a-descriptions-item>
          <a-descriptions-item label="收货地区">
            {{ record.address.region.province }}
            {{ record.address.region.city }}
            {{ record.address.region.region }}
          </a-descriptions-item>
          <a-descriptions-item label="详细地址">{{ record.address.detail }}</a-descriptions-item>
        </a-descriptions>
        <!-- 发货信息 -->
        <template
          v-if="(
            record.pay_status == PayStatusEnum.SUCCESS.value
              && record.delivery_status == DeliveryStatusEnum.DELIVERED.value
              && !inArray(record.order_status, [OrderStatusEnum.CANCELLED.value, OrderStatusEnum.APPLY_CANCEL.value])
          )"
        >
          <a-divider class="o-divider" />
          <a-descriptions title="发货信息">
            <a-descriptions-item label="物流公司">{{ record.express.express_name }}</a-descriptions-item>
            <a-descriptions-item label="物流单号">{{ record.express_no }}</a-descriptions-item>
            <a-descriptions-item label="发货状态">
              <a-tag
                :color="record.delivery_status == DeliveryStatusEnum.DELIVERED.value ? 'green' : ''"
              >{{ DeliveryStatusEnum[record.delivery_status].name }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="发货时间">{{ record.delivery_time }}</a-descriptions-item>
          </a-descriptions>
        </template>
      </a-card>

    </div>
    <DeliveryForm ref="DeliveryForm" @handleSubmit="handleRefresh" />
    <CancelForm ref="CancelForm" @handleSubmit="handleRefresh" />
    <PriceForm ref="PriceForm" @handleSubmit="handleRefresh" />
  </div>
</template>

<script>
import { inArray } from '@/utils/util'
import * as Api from '@/api/order'
import { GoodsItem, UserItem } from '@/components/Table'
import { DeliveryForm, CancelForm, PriceForm } from './modules'
import {
  DeliveryStatusEnum,
  DeliveryTypeEnum,
  OrderSourceEnum,
  OrderStatusEnum,
  PayStatusEnum,
  PayTypeEnum,
  ReceiptStatusEnum
} from '@/common/enum/order'

// 商品内容表头
const goodsColumns = [
  {
    title: '商品信息',
    scopedSlots: { customRender: 'goodsInfo' }
  },
  {
    title: '商品编码',
    dataIndex: 'goods_no',
    scopedSlots: { customRender: 'goods_no' }
  },
  {
    title: '重量(Kg)',
    dataIndex: 'goods_weight',
    scopedSlots: { customRender: 'goods_weight' }
  },
  {
    title: '单价',
    dataIndex: 'goods_price',
    scopedSlots: { customRender: 'goods_price' }
  },
  {
    title: '购买数量',
    dataIndex: 'total_num',
    scopedSlots: { customRender: 'total_num' }
  },
  {
    title: '商品总价',
    dataIndex: 'total_price',
    scopedSlots: { customRender: 'total_price' }
  }
]

export default {
  name: 'Index',
  components: {
    GoodsItem,
    UserItem,
    DeliveryForm,
    CancelForm,
    PriceForm
  },
  data () {
    return {
      // 枚举类
      DeliveryStatusEnum,
      DeliveryTypeEnum,
      OrderSourceEnum,
      OrderStatusEnum,
      PayStatusEnum,
      PayTypeEnum,
      ReceiptStatusEnum,
      // 外部方法
      inArray,
      // 正在加载
      isLoading: true,
      // 订单ID
      orderId: null,
      // 订单详情
      record: {},
      // 订单步骤位置
      progress: 2,
      // 商品内容表头
      goodsColumns
    }
  },
  created () {
    // 记录订单ID
    this.orderId = this.$route.query.orderId
    // 刷新页面
    this.handleRefresh()
  },
  methods: {

    // 刷新页面
    handleRefresh () {
      // 获取当前记录
      this.getDetail()
    },

    // 获取当前记录
    getDetail () {
      const { orderId } = this
      this.isLoading = true
      Api.detail({ orderId })
        .then(result => {
          // 当前记录
          this.record = result.data.detail
          // 初始化数据
          this.initData()
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    // 初始化数据
    initData () {
      // 步骤条位置
      this.initProgress()
    },

    // 步骤条位置
    initProgress () {
      const { record } = this
      this.progress = 2
      record.pay_status === PayStatusEnum.SUCCESS.value && (this.progress += 1)
      record.delivery_status === DeliveryStatusEnum.DELIVERED.value && (this.progress += 1)
      record.receipt_status === ReceiptStatusEnum.RECEIVED.value && (this.progress += 1)
    },

    // 渲染订单状态标签颜色
    renderOrderStatusColor (orderStatus) {
      const { OrderStatusEnum } = this
      const ColorEnum = {
        [OrderStatusEnum.NORMAL.value]: '',
        [OrderStatusEnum.CANCELLED.value]: 'red',
        [OrderStatusEnum.APPLY_CANCEL.value]: 'red',
        [OrderStatusEnum.COMPLETED.value]: 'green'
      }
      return ColorEnum[orderStatus]
    },

    // 订单发货
    handleDelivery () {
      const { record } = this
      this.$refs.DeliveryForm.show(record)
    },

    // 审核取消订单
    handleCancel () {
      const { record } = this
      this.$refs.CancelForm.show(record)
    },

    // 订单改价
    handleUpdatePrice () {
      const { record } = this
      this.$refs.PriceForm.show(record)
    }

  }
}
</script>
<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';
// 订单详情页
.order-content {
  margin-bottom: 70px;

  /deep/.ant-descriptions-item > span {
    vertical-align: middle;
  }

  // 分割线
  .o-divider {
    margin-bottom: 32px;
  }

  // 步骤条
  .order-progress {
    height: 26px;
    line-height: 26px;
    background: #f8f8f8;
    border-radius: 13px;
    font-size: 14px;
    text-align: center;
    position: relative;

    &:before,
    &:after {
      content: '';
      position: absolute;
      z-index: 2;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 13px;
      background: @primary-color;
    }

    &:after {
      background: ~`colorPalette('@{primary-color}', 3) `;
      z-index: 1;
    }

    &.progress-1 {
      &:before {
        width: 0;
      }

      &:after {
        width: 20%;
      }
    }

    &.progress-2 {
      &:before {
        width: 20%;
      }

      &:after {
        width: 40%;
      }
    }

    &.progress-3 {
      &:before {
        width: 40%;
      }

      &:after {
        width: 60%;
      }
    }

    &.progress-4 {
      &:before {
        width: 60%;
      }

      &:after {
        width: 80%;
      }
    }

    &.progress-5 {
      &:before {
        width: 100%;
      }

      &:after {
        width: 100%;
      }

      li {
        &:nth-child(5) {
          color: #fff;
        }
      }
    }

    li {
      width: 20%;
      float: left;
      border-radius: 13px;
      position: relative;
      z-index: 3;
    }

    .tip {
      font-size: 12px;
      padding-top: 10px;
      color: #8c8c8c;
    }

    &.progress-1 li:nth-child(1),
    &.progress-2 li:nth-child(1),
    &.progress-3 li:nth-child(1),
    &.progress-4 li:nth-child(1),
    &.progress-5 li:nth-child(1) {
      color: #fff;
    }

    &.progress-2 li:nth-child(2),
    &.progress-3 li:nth-child(2),
    &.progress-4 li:nth-child(2),
    &.progress-5 li:nth-child(2) {
      color: #fff;
    }

    &.progress-3 li:nth-child(3),
    &.progress-4 li:nth-child(3),
    &.progress-5 li:nth-child(3) {
      color: #fff;
    }

    &.progress-4 li:nth-child(4),
    &.progress-5 li:nth-child(4) {
      color: #fff;
    }
  }
  // 商品列表
  .goods-list {
    /deep/table {
      table-layout: auto;
    }
    .order-price {
      padding: 8px 20px;
      text-align: right;
    }
  }
  // 操作栏
  .actions {
    .action-item {
      float: left;
      margin-right: 8px;
    }
  }
}
</style>

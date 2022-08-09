<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="会员昵称/订单号">
            <a-input v-decorator="['search']" placeholder="请输入会员昵称/订单号" />
          </a-form-item>
          <a-form-item label="充值方式">
            <a-select v-decorator="['recharge_type', { initialValue: 0 }]">
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option
                v-for="(item, index) in RechargeTypeEnum.data"
                :key="index"
                :value="item.value"
              >{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="支付状态">
            <a-select v-decorator="['pay_status', { initialValue: 0 }]">
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option :value="10">待支付</a-select-option>
              <a-select-option :value="20">已支付</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="付款时间">
            <a-range-picker format="YYYY-MM-DD" v-decorator="['betweenTime']" />
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button type="primary" icon="search" html-type="submit">搜索</a-button>
          </a-form-item>
        </a-form>
      </a-row>
    </div>
    <s-table
      ref="table"
      rowKey="order_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 会员信息 -->
      <span slot="user" slot-scope="text">
        <UserItem :user="text" />
      </span>
      <!-- 套餐名称 -->
      <span slot="order_plan" slot-scope="text">
        <a-tag v-if="text">{{ text.plan_name }}</a-tag>
        <span v-else>--</span>
      </span>
      <!-- 充值方式 -->
      <span slot="recharge_type" slot-scope="text">
        <a-tag>{{ RechargeTypeEnum[text].name }}</a-tag>
      </span>
      <!-- 状态 -->
      <span slot="pay_status" slot-scope="text">
        <a-tag :color="text == 20 ? 'green' : ''">{{ text == 20 ? '已支付' : '待支付' }}</a-tag>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import * as Api from '@/api/user/recharge'
import { STable, UserItem } from '@/components/Table'
import PayStatusEnum from '@/common/enum/recharge/order/PayStatus'
import RechargeTypeEnum from '@/common/enum/recharge/order/RechargeType'

export default {
  name: 'Index',
  components: {
    STable,
    UserItem
  },
  data () {
    return {
      // 枚举类
      PayStatusEnum,
      RechargeTypeEnum,
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 查询参数
      queryParam: {},
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: 'ID',
          dataIndex: 'order_id'
        },
        {
          title: '会员信息',
          dataIndex: 'user',
          scopedSlots: { customRender: 'user' }
        },
        {
          title: '订单号',
          dataIndex: 'order_no'
        },
        {
          title: '充值方式',
          dataIndex: 'recharge_type',
          scopedSlots: { customRender: 'recharge_type' }
        },
        {
          title: '套餐名称',
          dataIndex: 'order_plan',
          scopedSlots: { customRender: 'order_plan' }
        },
        {
          title: '支付金额',
          dataIndex: 'pay_price'
        },
        {
          title: '赠送金额',
          dataIndex: 'gift_money'
        },
        {
          title: '支付状态',
          dataIndex: 'pay_status',
          scopedSlots: { customRender: 'pay_status' }
        },
        {
          title: '付款时间',
          dataIndex: 'pay_time'
        },
        {
          title: '创建时间',
          dataIndex: 'create_time'
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.order({ ...param, ...this.queryParam })
          .then(response => {
            return response.data.list
          })
      }
    }
  },
  created () {

  },
  methods: {

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = false) {
      this.$refs.table.refresh(bool)
    },

    // 确认搜索
    handleSearch (e) {
      e.preventDefault()
      this.searchForm.validateFields((error, values) => {
        if (!error) {
          this.queryParam = { ...this.queryParam, ...values }
          this.handleRefresh(true)
        }
      })
    }

  }
}
</script>

<style lang="less" scoped>
.ant-card-body {
  padding: 22px 29px 25px;
}
</style>

<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="优惠券名称">
            <a-input v-decorator="['couponName']" placeholder="请输入优惠券名称" />
          </a-form-item>
          <a-form-item label="会员昵称">
            <a-input v-decorator="['nickName']" placeholder="请输入会员昵称" />
          </a-form-item>
          <a-form-item label="领取时间">
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
      rowKey="user_coupon_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 会员信息 -->
      <template slot="user" slot-scope="item">
        <UserItem :user="item" />
      </template>
      <!-- 优惠券类型 -->
      <template slot="coupon_type" slot-scope="text">
        <a-tag>{{ CouponTypeEnum[text].name }}</a-tag>
      </template>
      <!-- 最低消费金额 -->
      <template slot="min_price" slot-scope="text">
        <p class="c-p">{{ text }}</p>
      </template>
      <!-- 优惠方式 -->
      <template slot="discount" slot-scope="item">
        <template v-if="item.coupon_type == CouponTypeEnum.FULL_DISCOUNT.value">
          <span>立减</span>
          <span class="c-p mlr-2">{{ item.reduce_price }}</span>
          <span>元</span>
        </template>
        <template v-if="item.coupon_type == CouponTypeEnum.DISCOUNT.value">
          <span>打</span>
          <span class="c-p mlr-2">{{ item.discount }}</span>
          <span>折</span>
        </template>
      </template>
      <!-- 有效期 -->
      <template slot="duetime" slot-scope="item">
        <template v-if="item.expire_type == 10">
          <span>领取</span>
          <span class="c-p mlr-2">{{ item.expire_day }}</span>
          <span>天内有效</span>
        </template>
        <template v-if="item.expire_type == 20">
          <span>{{ item.start_time }} ~ {{ item.end_time }}</span>
        </template>
      </template>
    </s-table>
  </a-card>
</template>

<script>
import * as Api from '@/api/market/coupon'
import { STable, UserItem } from '@/components/Table'
import { CouponTypeEnum } from '@/common/enum/coupon'

export default {
  name: 'Index',
  components: {
    STable,
    UserItem
  },
  data () {
    return {
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 查询参数
      queryParam: {},
      // 枚举类
      CouponTypeEnum,
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: 'ID',
          dataIndex: 'user_coupon_id'
        },
        {
          title: '会员信息',
          dataIndex: 'user',
          scopedSlots: { customRender: 'user' }
        },
        {
          title: '优惠券名称',
          dataIndex: 'name'
        },
        {
          title: '优惠券类型',
          dataIndex: 'coupon_type',
          scopedSlots: { customRender: 'coupon_type' }
        },
        {
          title: '最低消费金额 (元)',
          dataIndex: 'min_price',
          scopedSlots: { customRender: 'min_price' }
        },
        {
          title: '优惠方式',
          scopedSlots: { customRender: 'discount' }
        },
        {
          title: '有效期',
          scopedSlots: { customRender: 'duetime' }
        },
        {
          title: '领取时间',
          dataIndex: 'create_time'
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.receive({ ...param, ...this.queryParam })
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

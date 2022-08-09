<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-alert message="注：优惠券只能抵扣商品金额，最多优惠到0.01元，不能抵扣运费" banner />
    <div class="table-operator">
      <a-row>
        <a-col :span="6">
          <a-button
            v-if="$auth('/market/coupon/create')"
            type="primary"
            icon="plus"
            @click="handleAdd"
          >新增</a-button>
        </a-col>
        <a-col :span="8" :offset="10">
          <a-input-search
            style="max-width: 300px; min-width: 150px;float: right;"
            v-model="queryParam.search"
            placeholder="请输入优惠券名称"
            @search="onSearch"
          />
        </a-col>
      </a-row>
    </div>
    <s-table
      ref="table"
      rowKey="coupon_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
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
        <template v-if="item.coupon_type == 10">
          <span>立减</span>
          <span class="c-p mlr-2">{{ item.reduce_price }}</span>
          <span>元</span>
        </template>
        <template v-if="item.coupon_type == 20">
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
      <!-- 状态 -->
      <template slot="status" slot-scope="text">
        <a-tag :color="text ? 'green' : ''">{{ text ? '显示' : '隐藏' }}</a-tag>
      </template>
      <!-- 操作 -->
      <span class="actions" slot="action" slot-scope="item">
        <a v-if="$auth('/market/coupon/update')" @click="handleEdit(item)">编辑</a>
        <a v-action:delete @click="handleDelete(item)">删除</a>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import * as Api from '@/api/market/coupon'
import { STable } from '@/components'
import { ApplyRangeEnum, CouponTypeEnum, ExpireTypeEnum } from '@/common/enum/coupon'

export default {
  name: 'Index',
  components: {
    STable
  },
  data () {
    return {
      // 查询参数
      queryParam: {},
      // 枚举类
      ApplyRangeEnum,
      CouponTypeEnum,
      ExpireTypeEnum,
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: '优惠券ID',
          dataIndex: 'coupon_id'
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
        // {
        //   title: '有效期',
        //   scopedSlots: { customRender: 'duetime' }
        // },
        // {
        //   title: '发放总数量',
        //   dataIndex: 'total_num'
        // },
        {
          title: '已发放/领取数量',
          dataIndex: 'receive_num'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '排序',
          dataIndex: 'sort'
        },
        {
          title: '添加时间',
          dataIndex: 'create_time'
        },
        {
          title: '操作',
          width: '180px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.list({ ...param, ...this.queryParam })
          .then(response => {
            return response.data.list
          })
      }
    }
  },
  created () {

  },
  methods: {

    // 新增记录
    handleAdd () {
      this.$router.push('./create')
    },

    // 编辑记录
    handleEdit (item) {
      this.$router.push({ path: './update', query: { couponId: item.coupon_id } })
    },

    /**
     * 删除记录
     */
    handleDelete (item) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        content: '删除后不可恢复',
        onOk () {
          return Api.deleted({ couponId: item.coupon_id })
            .then((result) => {
              app.$message.success(result.message, 1.5)
              app.handleRefresh()
            })
            .finally(result => {
              modal.destroy()
            })
        }
      })
    },

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = false) {
      this.$refs.table.refresh(bool)
    },

    /**
     * 检索查询
     */
    onSearch () {
      this.handleRefresh(true)
    }

  }
}
</script>

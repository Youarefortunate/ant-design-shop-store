<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="商品名称">
            <a-input v-decorator="['goodsName']" placeholder="请输入商品名称/编码" />
          </a-form-item>
          <a-form-item label="订单号">
            <a-input v-decorator="['orderNo']" placeholder="请输入订单号" />
          </a-form-item>
          <a-form-item label="会员ID">
            <a-input v-decorator="['userId']" placeholder="请输入会员ID" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-decorator="['status', { initialValue: -1 }]">
              <a-select-option :value="-1">全部</a-select-option>
              <a-select-option :value="1">显示</a-select-option>
              <a-select-option :value="0">隐藏</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button type="primary" icon="search" html-type="submit">搜索</a-button>
          </a-form-item>
        </a-form>
      </a-row>
      <!-- 操作板块 -->
      <div class="row-item-tab clearfix">
        <div class="tab-list fl-l">
          <a-radio-group :defaultValue="queryParam.score" @change="handleTabs">
            <a-radio-button :value="0">全部</a-radio-button>
            <a-radio-button :value="10">好评</a-radio-button>
            <a-radio-button :value="20">中评</a-radio-button>
            <a-radio-button :value="30">差评</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </div>
    <s-table
      ref="table"
      rowKey="comment_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 商品信息 -->
      <span slot="orderGoods" slot-scope="goods">
        <GoodsItem
          :data="{
            image: goods.goods_image,
            imageAlt: '商品图片',
            title: goods.goods_name,
            goodsProps: goods.goods_props
          }"
        />
      </span>
      <!-- 买家 -->
      <span slot="user" slot-scope="text">
        <p>{{ text.nick_name }}</p>
        <p>
          <span style="font-size: 12px;color: #7b7b7b;">(ID: 11649)</span>
        </p>
      </span>
      <!-- 评分 -->
      <span slot="score" slot-scope="text">
        <a-tag
          :color="{10: 'green', 20: '', 30: 'red'}[text]"
        >{{ {10: '好评', 20: '中评', 30: '差评'}[text] }}</a-tag>
      </span>
      <!-- 评价内容 -->
      <span slot="content" slot-scope="text">
        <p class="twoline-hide" style="width: 270px;">{{ text }}</p>
      </span>
      <!-- 图片评价 -->
      <span slot="is_picture" slot-scope="text">
        <a-tag :color="text ? 'green' : ''">{{ text ? '是' : '否' }}</a-tag>
      </span>
      <!-- 状态 -->
      <span slot="status" slot-scope="text">
        <a-tag :color="text ? 'green' : ''">{{ text ? '显示' : '隐藏' }}</a-tag>
      </span>
      <!-- 操作项 -->
      <span slot="action" slot-scope="text, item">
        <a v-action:edit style="margin-right: 8px;" @click="handleEdit(item)">编辑</a>
        <a v-action:delete @click="handleDelete(item)">删除</a>
      </span>
    </s-table>
    <EditForm ref="EditForm" @handleSubmit="handleRefresh" />
  </a-card>
</template>

<script>
import * as CommentApi from '@/api/goods/comment'
import { ContentHeader } from '@/components'
import { STable, GoodsItem } from '@/components/Table'
import EditForm from './modules/EditForm'

// 表格表头
const columns = [
  {
    title: 'ID',
    dataIndex: 'comment_id'
  },
  {
    title: '商品信息',
    dataIndex: 'orderGoods',
    scopedSlots: { customRender: 'orderGoods' }
  },
  {
    title: '买家',
    dataIndex: 'user',
    scopedSlots: { customRender: 'user' }
  },
  {
    title: '评分',
    dataIndex: 'score',
    scopedSlots: { customRender: 'score' }
  },
  {
    title: '评价内容',
    dataIndex: 'content',
    scopedSlots: { customRender: 'content' }
  },
  {
    title: '图片评价',
    dataIndex: 'is_picture',
    scopedSlots: { customRender: 'is_picture' }
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
    title: '评价时间',
    dataIndex: 'create_time'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '180px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'Index',
  components: {
    ContentHeader,
    STable,
    GoodsItem,
    EditForm
  },
  data () {
    return {
      expand: false,
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 评价分类列表
      categoryListTree: [],
      // 查询参数
      queryParam: {
        score: 0
      },
      // 正在加载
      isLoading: false,
      // 表头
      columns,
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return CommentApi.list({ ...param, ...this.queryParam })
          .then(response => {
            // let res = JSON.parse(JSON.stringify(response))
            return response.data.list
          })
      }
    }
  },
  created () {

  },
  methods: {

    // 切换tab
    handleTabs (e) {
      this.queryParam.score = e.target.value
      this.handleRefresh(true)
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
          return CommentApi.deleted({ commentId: item.comment_id })
            .then(result => {
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
     * 编辑记录
     */
    handleEdit (item) {
      this.$refs.EditForm.edit(item.comment_id)
    },

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = false) {
      this.$refs.table.refresh(bool)
    }
  }
}
</script>
<style lang="less" scoped>
.ant-card-body {
  padding: 22px 29px 25px;
}
// 筛选tab
.tab-list {
  margin-right: 20px;
}
</style>

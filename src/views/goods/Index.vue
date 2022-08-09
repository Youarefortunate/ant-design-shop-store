<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="商品名称">
            <a-input v-decorator="['goodsName']" placeholder="请输入商品名称" />
          </a-form-item>
          <a-form-item label="商品编码">
            <a-input v-decorator="['goodsNo']" placeholder="请输入商品编码" />
          </a-form-item>
          <a-form-item label="商品分类">
            <a-tree-select
              :treeData="categoryListTree"
              :dropdownStyle="{ maxHeight: '500px', overflow: 'auto' }"
              allowClear
              v-decorator="['categoryId', { initialValue: 0 }]"
            ></a-tree-select>
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button type="primary" icon="search" html-type="submit">搜索</a-button>
          </a-form-item>
        </a-form>
      </a-row>
      <!-- 操作板块 -->
      <div class="row-item-tab clearfix">
        <div class="tab-list fl-l">
          <a-radio-group :defaultValue="queryParam.listType" @change="handleTabs">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="on_sale">出售中</a-radio-button>
            <a-radio-button value="off_sale">已下架</a-radio-button>
            <a-radio-button value="sold_out">已售罄</a-radio-button>
          </a-radio-group>
        </div>
        <a-button
          v-if="$auth('/goods/create')"
          class="fl-l"
          type="primary"
          icon="plus"
          @click="handleCreate"
        >创建商品</a-button>
        <div v-if="selectedRowKeys.length" class="button-group">
          <a-button-group class="ml-10">
            <a-button
              v-action:status
              icon="arrow-up"
              @click="handleUpdateStatus(selectedRowKeys, true)"
            >上架</a-button>
            <a-button
              v-action:status
              icon="arrow-down"
              @click="handleUpdateStatus(selectedRowKeys, false)"
            >下架</a-button>
            <a-button v-action:delete icon="delete" @click="handleDelete(selectedRowKeys)">删除</a-button>
          </a-button-group>
        </div>
      </div>
    </div>
    <s-table
      ref="table"
      rowKey="goods_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :rowSelection="rowSelection"
      :pageSize="15"
    >
      <!-- 商品图片 -->
      <span slot="goods_image" slot-scope="text">
        <a title="点击查看原图" :href="text" target="_blank">
          <img width="50" height="50" :src="text" alt="商品图片" />
        </a>
      </span>
      <!-- 商品名称 -->
      <span slot="goods_name" slot-scope="text">
        <p class="twoline-hide" style="width: 270px;">{{ text }}</p>
      </span>
      <!-- 商品状态 -->
      <span slot="status" slot-scope="text, item">
        <a-tag
          class="cur-p"
          :color="text == 10 ? 'green' : 'red'"
          @click="handleUpdateStatus([item.goods_id], text != 10)"
        >{{ text == 10 ? '上架' : '下架' }}</a-tag>
      </span>
      <!-- 操作项 -->
      <div class="actions" slot="action" slot-scope="text, item">
        <router-link :to="{ path: '/goods/update', query: { goodsId: item.goods_id } }">编辑</router-link>
        <a v-action:delete @click="handleDelete([item.goods_id])">删除</a>
      </div>
    </s-table>
  </a-card>
</template>

<script>
import * as GoodsApi from '@/api/goods'
import { ContentHeader, STable } from '@/components'
import CategoryModel from '@/common/model/Category'

// 表格表头
const columns = [
  {
    title: '商品ID',
    dataIndex: 'goods_id'
  },
  {
    title: '商品图片',
    dataIndex: 'goods_image',
    scopedSlots: { customRender: 'goods_image' }
  },
  {
    title: '商品名称',
    dataIndex: 'goods_name',
    scopedSlots: { customRender: 'goods_name' }
  },
  {
    title: '商品价格',
    dataIndex: 'goods_price_min',
    scopedSlots: { customRender: 'goods_price_min' }
  },
  {
    title: '总销量',
    dataIndex: 'sales_actual'
  },
  {
    title: '库存总量',
    dataIndex: 'stock_total'
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
    dataIndex: 'action',
    width: '180px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'Index',
  components: {
    ContentHeader,
    STable
  },
  data () {
    return {
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 商品分类列表
      categoryListTree: [],
      // 查询参数
      queryParam: {
        listType: 'all'
      },
      // 正在加载
      isLoading: false,
      // 表头
      columns,
      // 选择的元素
      selectedRowKeys: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return GoodsApi.list({ ...param, ...this.queryParam })
          .then(response => {
            // console.log(response);
            return response.data.list
          })
      }
    }
  },
  created () {
    // 默认的查询参数
    if (this.$route.query.listType) {
      this.queryParam.listType = this.$route.query.listType
    }
    // 获取商品分类列表
    this.getCategoryList()
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {

    /**
     * 选中项发生变化时的回调
     */
    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 切换tab
    handleTabs (e) {
      this.queryParam.listType = e.target.value
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

    // 重置搜索表单
    handleReset () {
      this.searchForm.resetFields()
    },

    // 获取分类列表
    getCategoryList () {
      this.isLoading = true
      CategoryModel.getListFromScreen()
        .then(selectList => {
          this.categoryListTree = selectList
        })
        .finally(result => {
          this.isLoading = false
        })
    },

    // 修改商品状态(上下架)
    handleUpdateStatus (goodsIds, state = true) {
      if (!this.$auth('/goods/index.status')) {
        return false
      }
      this.isLoading = true
      GoodsApi.state({ goodsIds, state })
        .then(result => {
          // 显示成功
          this.$message.success(result.message, 1.5)
          this.handleRefresh()
        })
        .finally(result => { this.isLoading = false })
    },

    /**
     * 删除记录
     */
    handleDelete (goodsIds) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        content: '删除后不可恢复',
        onOk () {
          return GoodsApi.deleted({ goodsIds })
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
     * 新增记录
     */
    handleCreate () {
      this.$router.push('/goods/create')
    },

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = false) {
      this.selectedRowKeys = []
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

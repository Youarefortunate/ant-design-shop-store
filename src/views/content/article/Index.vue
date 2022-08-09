<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="文章标题">
            <a-input v-decorator="['title']" placeholder="请输入文章标题" />
          </a-form-item>
          <a-form-item label="文章分类">
            <a-select v-decorator="['categoryId', { initialValue: -1 }]">
              <a-select-option :value="-1">全部</a-select-option>
              <a-select-option
                v-for="(item, index) in categoryList"
                :key="index"
                :value="item.category_id"
              >{{ item.name }}</a-select-option>
            </a-select>
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
        <a-button v-action:add type="primary" icon="plus" @click="handleAdd">新增</a-button>
      </div>
    </div>
    <s-table
      ref="table"
      rowKey="article_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 文章封面图 -->
      <span slot="image_url" slot-scope="text">
        <a title="点击查看原图" :href="text" target="_blank">
          <img height="50" :src="text" alt="封面图" />
        </a>
      </span>
      <!-- 文章标题 -->
      <span slot="stitle" slot-scope="text">
        <p class="twoline-hide" style="width: 270px;">{{ text }}</p>
      </span>
      <!-- 所属分类 -->
      <span slot="category" slot-scope="text">{{ text.name }}</span>
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
    <AddForm ref="AddForm" :categoryList="categoryList" @handleSubmit="handleRefresh" />
    <EditForm ref="EditForm" :categoryList="categoryList" @handleSubmit="handleRefresh" />
  </a-card>
</template>

<script>
import * as ArticleApi from '@/api/content/article'
import * as CategoryApi from '@/api/content/article/category'
import { ContentHeader, STable } from '@/components'
import EditForm from './modules/EditForm'
import AddForm from './modules/AddForm'

// 表格表头
const columns = [
  {
    title: 'ID',
    dataIndex: 'article_id'
  },
  {
    title: '封面图',
    dataIndex: 'image_url',
    scopedSlots: { customRender: 'image_url' }
  },
  {
    title: '文章标题',
    dataIndex: 'title',
    scopedSlots: { customRender: 'stitle' }
  },
  {
    title: '所属分类',
    dataIndex: 'category',
    scopedSlots: { customRender: 'category' }
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
    title: '创建时间',
    dataIndex: 'create_time'
  },
  {
    title: '更新时间',
    dataIndex: 'update_time'
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
    AddForm,
    EditForm
  },
  data () {
    return {
      expand: false,
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 分类列表
      categoryList: [],
      // 查询参数
      queryParam: {},
      // 正在加载
      isLoading: false,
      // 表头
      columns,
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return ArticleApi.list({ ...param, ...this.queryParam })
          .then(response => {
            return response.data.list
          })
      }
    }
  },
  created () {
    // 获取分类列表
    this.getCategoryList()
  },
  methods: {

    /**
     * 获取分类列表
     */
    getCategoryList () {
      this.isLoading = true
      CategoryApi.list()
        .then(result => {
          this.categoryList = result.data.list
        })
        .finally(result => {
          this.isLoading = false
        })
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
          return ArticleApi.deleted({ articleId: item.article_id })
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
    handleAdd () {
      this.$refs.AddForm.add()
    },

    /**
     * 编辑记录
     */
    handleEdit (item) {
      this.$refs.EditForm.edit(item.article_id)
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

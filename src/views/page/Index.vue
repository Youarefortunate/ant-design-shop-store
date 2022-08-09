<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <a-row>
        <a-col :span="6">
          <a-button v-if="$auth('/page/create')" type="primary" icon="plus" @click="handleAdd">新增</a-button>
        </a-col>
        <a-col :span="8" :offset="10">
          <a-input-search
            class="input-search"
            v-model="queryParam.name"
            placeholder="请输入页面名称"
            @search="onSearch"
          />
        </a-col>
      </a-row>
    </div>
    <s-table
      ref="table"
      rowKey="page_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 页面类型 -->
      <template slot="page_type" slot-scope="text">
        <a-tag :color="text == PageTypeEnum.HOME.value ? 'green' : ''">{{ PageTypeEnum[text].name }}</a-tag>
      </template>
      <!-- 操作 -->
      <span class="actions" slot="action" slot-scope="item">
        <a v-if="$auth('/page/update')" @click="handleEdit(item)">编辑</a>
        <a
          v-action:setHome
          v-if="item.page_type != PageTypeEnum.HOME.value"
          @click="handleSetHome(item)"
        >设为首页</a>
        <a
          v-action:delete
          v-if="item.page_type != PageTypeEnum.HOME.value"
          @click="handleDelete(item)"
        >删除</a>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import * as Api from '@/api/page'
import { STable } from '@/components'
import { PageTypeEnum } from '@/common/enum/page'

const columns = [
  {
    title: '页面ID',
    dataIndex: 'page_id'
  },
  {
    title: '页面名称',
    dataIndex: 'page_name'
  },
  {
    title: '页面类型',
    dataIndex: 'page_type',
    scopedSlots: { customRender: 'page_type' }
  },
  {
    title: '添加时间',
    dataIndex: 'create_time'
  },
  {
    title: '更新时间',
    dataIndex: 'update_time'
  },
  {
    title: '操作',
    width: '180px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'Index',
  components: {
    STable
  },
  data () {
    return {
      // 查询参数
      queryParam: { name: '' },
      // 枚举类
      PageTypeEnum,
      // 正在加载
      isLoading: false,
      // 表头
      columns,
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

    // 新增页面
    handleAdd () {
      this.$router.push('./create')
    },

    // 编辑页面
    handleEdit (item) {
      this.$router.push({ path: './update', query: { pageId: item.page_id } })
    },

    // 设置为首页
    handleSetHome (item) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要设置为首页吗?',
        onOk () {
          return Api.setHome({ pageId: item.page_id })
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

    // 删除记录
    handleDelete (item) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        content: '删除后不可恢复',
        onOk () {
          return Api.deleted({ pageId: item.page_id })
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
<style lang="less">
.input-search {
  max-width: 300px;
  min-width: 150px;
  float: right;
}
</style>

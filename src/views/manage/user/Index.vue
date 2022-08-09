<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <a-row>
        <a-col :span="6">
          <a-button v-action:add type="primary" icon="plus" @click="handleAdd">新增</a-button>
        </a-col>
        <a-col :span="8" :offset="10">
          <a-input-search
            style="max-width: 300px; min-width: 150px;float: right;"
            v-model="queryParam.search"
            placeholder="请输入用户名/姓名"
            @search="onSearch"
          />
        </a-col>
      </a-row>
    </div>
    <s-table
      ref="table"
      rowKey="store_user_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <div slot="user_name" slot-scope="text, item">
        <span style="margin-right: 6px">{{ text }}</span>
        <a-tag v-if="item.is_super" color="green">超级管理员</a-tag>
      </div>
      <div class="actions" slot="action" slot-scope="text, item">
        <a v-action:edit @click="handleEdit(item)">编辑</a>
        <template v-if="!item.is_super">
          <a v-action:delete @click="handleDelete(item)">删除</a>
        </template>
      </div>
    </s-table>
    <AddForm ref="AddForm" :roleList="roleList" @handleSubmit="handleRefresh" />
    <EditForm ref="EditForm" :roleList="roleList" @handleSubmit="handleRefresh" />
  </a-card>
</template>

<script>
import * as Api from '@/api/store/user'
import * as RoleApi from '@/api/store/role'
import { STable } from '@/components'
import AddForm from './modules/AddForm'
import EditForm from './modules/EditForm'

export default {
  name: 'Index',
  components: {
    STable,
    AddForm,
    EditForm
  },
  data () {
    return {
      // 角色列表
      roleList: [],
      // 查询参数
      queryParam: {},
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: '管理员ID',
          dataIndex: 'store_user_id'
        },
        {
          title: '用户名',
          dataIndex: 'user_name',
          scopedSlots: { customRender: 'user_name' }
        },
        {
          title: '姓名',
          dataIndex: 'real_name'
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
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.list({ ...param, ...this.queryParam })
          .then(response => {
            // console.log(response);
            return response.data.list
          })
      }
    }
  },
  created () {
    // 获取角色列表
    this.getRoleList()
  },
  methods: {

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
      this.$refs.EditForm.edit(item)
    },

    /**
     * 获取角色列表
     */
    getRoleList () {
      this.isLoading = true
      RoleApi.list()
        .then(result => {
          this.roleList = result.data.list
        })
        .finally(() => {
          this.isLoading = false
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
          return Api.deleted({ userId: item['store_user_id'] })
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

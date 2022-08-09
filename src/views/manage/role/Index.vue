<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
    </div>
    <a-table
      v-if="!isLoading"
      rowKey="role_id"
      :columns="columns"
      :dataSource="roleList"
      :defaultExpandAllRows="true"
      :expandIconColumnIndex="1"
      :pagination="false"
      :loading="isLoading"
    >
      <span slot="action" slot-scope="text, item">
        <template>
          <a v-action:edit style="margin-right: 8px;" @click="handleEdit(item)">编辑</a>
          <a v-action:delete @click="handleDelete(item)">删除</a>
        </template>
      </span>
    </a-table>
    <AddForm
      ref="AddForm"
      :roleList="roleList"
      :menuList="menuList"
      @handleSubmit="handleRefresh"
    />
    <EditForm
      ref="EditForm"
      :roleList="roleList"
      :menuList="menuList"
      @handleSubmit="handleRefresh"
    />
  </a-card>
</template>

<script>
import * as Api from '@/api/store/role'
import * as MenuApi from '@/api/store/menu'
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
      isLoading: true,
      // 表头
      columns: [
        {
          title: '角色ID',
          dataIndex: 'role_id'
        },
        {
          title: '角色名称',
          dataIndex: 'role_name'
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
      // 权限列表
      menuList: []
    }
  },
  created () {
    // 获取角色列表
    this.getRoleList()
  },
  methods: {

    /**
     * 获取角色列表
     */
    getRoleList () {
      this.isLoading = true
      Api.list()
        .then(result => {
          this.roleList = result.data.list
        })
        .finally(result => {
          this.isLoading = false
        })
    },

    /**
     * 获取菜单列表数据
     */
    async getMenuList () {
      if (!this.menuList.length) {
        this.isLoading = true
        await MenuApi.list().then(response => {
          this.menuList = response.data.list
        }).finally(() => {
          this.isLoading = false
        })
      }
    },

    /**
     * 新增记录
     */
    async handleAdd () {
      // 等待获取完菜单列表数据之后,才会去调用新增组件中的add方法
      await this.getMenuList()
      // 显示对话框
      this.$refs.AddForm.add()
    },

    /**
     * 编辑记录
     */
    async handleEdit (record) {
      // 获取菜单列表数据
      await this.getMenuList()
      // 显示对话框
      this.$refs.EditForm.edit(record)
    },

    /**
     * 删除记录
     */
    handleDelete (record) {
      const self = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        content: '删除后不可恢复',
        onOk () {
          return Api.deleted({ roleId: record['role_id'] })
            .then(result => {
              self.$message.success(result.message, 1.5)
              self.handleRefresh()
            })
            .finally(result => {
              modal.destroy()
            })
        }
      })
    },

    /**
     * 刷新列表
     */
    handleRefresh () {
      // 获取角色列表
      this.getRoleList()
    }

  }
}
</script>

<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <a-button v-action:add type="primary" icon="plus" @click="handleAdd">新增</a-button>
    </div>
    <a-table
      v-if="!isLoading"
      rowKey="group_id"
      :columns="columns"
      :dataSource="groupList"
      :defaultExpandAllRows="true"
      :expandIconColumnIndex="1"
      :pagination="false"
      :loading="isLoading"
    >
      <span slot="action" slot-scope="text, item">
        <a v-action:edit style="margin-right: 8px;" @click="handleEdit(item)">编辑</a>
        <a v-action:delete @click="handleDelete(item)">删除</a>
      </span>
    </a-table>
    <AddForm ref="AddForm" :groupList="groupList" @handleSubmit="handleRefresh" />
    <EditForm ref="EditForm" :groupList="groupList" @handleSubmit="handleRefresh" />
  </a-card>
</template>

<script>
import * as Api from '@/api/files/group'
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
      // 分组列表
      groupList: [],
      // 查询参数
      queryParam: {},
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: '分组ID',
          dataIndex: 'group_id'
        },
        {
          title: '分组名称',
          dataIndex: 'name'
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
    }
  },
  created () {
    // 获取分组列表
    this.getGroupList()
  },
  methods: {

    /**
     * 获取分组列表
     */
    getGroupList () {
      this.isLoading = true
      Api.list()
        .then(result => {
          this.groupList = result.data.list
        })
        .finally(result => {
          this.isLoading = false
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
      this.$refs.EditForm.edit(item)
    },

    /**
     * 删除记录
     */
    handleDelete (item) {
      const self = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        content: '删除后不可恢复',
        onOk () {
          return Api.deleted({ groupId: item['group_id'] })
            .then((result) => {
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
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh () {
      // 获取分组列表
      this.getGroupList()
    }

  }
}
</script>

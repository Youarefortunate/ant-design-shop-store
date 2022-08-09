<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <a-row>
        <a-col :span="5">
          <a-button v-action:add type="primary" icon="plus" @click="handleAdd">新增</a-button>
        </a-col>
        <a-col class="flex flex-x-end" :span="11" :offset="8">
          <a-select
            style="width: 220px; margin-right: 20px;"
            placeholder="请选择地址类型"
            v-model="queryParam.type"
          >
            <a-select-option :value="0">全部</a-select-option>
            <a-select-option :value="10">发货地址</a-select-option>
            <a-select-option :value="20">退货地址</a-select-option>
          </a-select>
          <a-input-search
            style="max-width: 300px; min-width: 150px;"
            v-model="queryParam.search"
            placeholder="请输入姓名/联系电话"
            @search="onSearch"
          />
        </a-col>
      </a-row>
    </div>
    <s-table
      ref="table"
      rowKey="address_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 详细地址 -->
      <span slot="full_address" slot-scope="text">
        <p class="twoline-hide" style="width: 270px;">{{ text }}</p>
      </span>
      <!-- 地址类型 -->
      <span slot="type" slot-scope="text">
        <a-tag>{{ text == 10 ? '发货地址' : '退货地址' }}</a-tag>
      </span>
      <!-- 操作 -->
      <span slot="action" slot-scope="text, item">
        <a v-action:edit style="margin-right: 8px;" @click="handleEdit(item)">编辑</a>
        <a v-action:delete @click="handleDelete(item)">删除</a>
      </span>
    </s-table>
    <AddForm ref="AddForm" @handleSubmit="handleRefresh" />
    <EditForm ref="EditForm" @handleSubmit="handleRefresh" />
  </a-card>
</template>

<script>
import * as Api from '@/api/store/address'
import { STable } from '@/components'
import { AddForm, EditForm } from './modules'

export default {
  name: 'Index',
  components: {
    STable,
    AddForm,
    EditForm
  },
  data () {
    return {
      // 查询参数
      queryParam: {},
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: '地址ID',
          dataIndex: 'address_id'
        },
        {
          title: '联系人姓名',
          dataIndex: 'name'
        },
        {
          title: '联系电话',
          dataIndex: 'phone'
        },
        {
          title: '详细地址',
          dataIndex: 'full_address',
          scopedSlots: { customRender: 'full_address' }
        },
        {
          title: '地址类型',
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' }
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
            return response.data.list
          })
      }
    }
  },
  created () { },
  methods: {

    // 新增记录
    handleAdd () {
      this.$refs.AddForm.add()
    },

    // 编辑记录
    handleEdit (item) {
      this.$refs.EditForm.edit(item)
    },

    // 删除记录
    handleDelete (item) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        content: '删除后不可恢复',
        onOk () {
          return Api.deleted({ addressId: item.address_id })
            .then(result => {
              app.$message.success(result.message, 1.5)
              app.handleRefresh()
            })
            .finally(result => modal.destroy())
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

    // 检索查询
    onSearch () {
      this.handleRefresh(true)
    }

  }
}
</script>

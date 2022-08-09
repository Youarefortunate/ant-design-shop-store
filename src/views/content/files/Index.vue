<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="文件名称">
            <a-input v-decorator="['fileName']" placeholder="请输入文件名称" />
          </a-form-item>
          <a-form-item label="文件分组">
            <a-tree-select
              treeDefaultExpandAll
              allowClear
              :treeData="groupListTreeSelect"
              :dropdownStyle="{ maxHeight: '500px', overflow: 'auto' }"
              v-decorator="['groupId', { initialValue: -1 }]"
            ></a-tree-select>
          </a-form-item>
          <a-form-item label="存储方式">
            <a-select v-decorator="['storage', { initialValue: '' }]">
              <a-select-option :value="''">全部</a-select-option>
              <a-select-option
                v-for="(item, index) in StorageEnum.data"
                :key="index"
                :value="item.value"
              >{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="上传来源">
            <a-select v-decorator="['channel', { initialValue: -1 }]">
              <a-select-option :value="-1">全部</a-select-option>
              <a-select-option
                v-for="(item, index) in ChannelEnum.data"
                :key="index"
                :value="item.value"
              >{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button type="primary" icon="search" html-type="submit">搜索</a-button>
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </a-row>
      <!-- 操作板块 -->
      <div class="row-item-tab clearfix">
        <div class="tab-list fl-l">
          <a-radio-group :defaultValue="queryParam.fileType" @change="handleTabs">
            <a-radio-button :value="-1">全部</a-radio-button>
            <a-radio-button
              v-for="(item, index) in FileTypeEnum.data"
              :key="index"
              :value="item.value"
            >{{ item.name }}</a-radio-button>
          </a-radio-group>
        </div>
        <div v-if="selectedRowKeys.length" class="button-group">
          <a-button-group>
            <a-button icon="swap" @click="handleBatchMove">移动</a-button>
            <a-button icon="delete" @click="handleBatchDelete">删除</a-button>
          </a-button-group>
        </div>
      </div>
    </div>
    <!-- 列表内容 -->
    <s-table
      ref="table"
      rowKey="file_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :rowSelection="rowSelection"
      :pageSize="15"
    >
      <!-- 文件预览 -->
      <span slot="preview_url" slot-scope="text, item">
        <div class="preview-box">
          <a :href="item.external_url" target="_blank">
            <img :src="text" />
          </a>
        </div>
      </span>
      <!-- 存储方式 -->
      <span slot="storage" slot-scope="text">
        <a-tag>{{ StorageEnum[text].name }}</a-tag>
      </span>
      <!-- 文件类型 -->
      <span slot="file_type" slot-scope="text">
        <a-tag>{{ FileTypeEnum[text].name }}</a-tag>
      </span>
      <!-- 操作 -->
      <span slot="action" slot-scope="text, item">
        <a v-action:edit style="margin-right: 8px;" @click="handleEdit(item)">编辑</a>
        <a v-action:delete @click="handleDelete(item)">删除</a>
      </span>
    </s-table>
    <!-- 移动分组 -->
    <MoveGroupForm ref="MoveGroupForm" :groupList="groupListTree" @handleSubmit="handleRefresh" />
    <!-- 编辑记录 -->
    <EditForm ref="EditForm" :groupList="groupListTree" @handleSubmit="handleRefresh" />
  </a-card>
</template>

<script>
import * as Api from '@/api/files'
import * as GroupApi from '@/api/files/group'
import { STable } from '@/components'
import MoveGroupForm from './modules/MoveGroupForm'
import EditForm from './modules/EditForm'
import FileTypeEnum from '@/common/enum/file/FileType'
import StorageEnum from '@/common/enum/file/Storage'
import ChannelEnum from '@/common/enum/file/Channel'

export default {
  name: 'Index',
  components: {
    STable,
    MoveGroupForm,
    EditForm
  },
  data () {
    return {
      // 枚举数据
      FileTypeEnum,
      StorageEnum,
      ChannelEnum,
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 查询参数
      queryParam: { fileType: -1 },
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: '文件ID',
          dataIndex: 'file_id'
        },
        {
          title: '文件预览',
          dataIndex: 'preview_url',
          scopedSlots: { customRender: 'preview_url' }
        },
        {
          title: '文件名称',
          dataIndex: 'file_name'
        },
        {
          title: '存储方式',
          dataIndex: 'storage',
          scopedSlots: { customRender: 'storage' }
        },
        {
          title: '文件类型',
          dataIndex: 'file_type',
          scopedSlots: { customRender: 'file_type' }
        },
        {
          title: '文件大小(字节)',
          dataIndex: 'file_size'
        },
        {
          title: '文件后缀',
          dataIndex: 'file_ext'
        },
        {
          title: '上传时间',
          dataIndex: 'create_time'
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '180px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      selectedRowKeys: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.list({ ...param, ...this.queryParam })
          .then(response => {
            return response.data.list
          })
      },
      // 文件分组列表(树状结构)
      groupListTree: [],
      // 文件分组列表(用于筛选组件)
      groupListTreeSelect: []
    }
  },
  created () {
    // 获取分组列表
    this.getGroupList()
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
     * 选中项发生变化时的回调 selectedRowKeys选中文件的id
     */
    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 切换tab
    handleTabs (e) {
      this.queryParam.fileType = e.target.value
      this.handleRefresh()
    },

    // 确认搜索
    handleSearch (e) {
      e.preventDefault()
      this.searchForm.validateFields((error, values) => {
        if (!error) {
          this.queryParam = { ...this.queryParam, ...values }
          this.handleRefresh()
        }
      })
    },

    // 重置搜索表单
    handleReset () {
      this.selectedRowKeys = []
      this.searchForm.resetFields()
    },

    /**
     * 获取分组列表
     */
    getGroupList () {
      this.isLoading = true
      GroupApi.list().then(result => {
        const { list } = result.data
        // 格式化分组列表
        const groupListTree = this.formatTreeData(list)
        // 记录到data
        this.groupListTree = groupListTree
        this.groupListTreeSelect = [{
          title: '全部',
          key: -1,
          value: -1
        }, {
          title: '未分组',
          key: 0,
          value: 0
        }].concat(groupListTree)
      })
        .finally(result => {
          this.isLoading = false
        })
    },

    /**
     * 格式化分组列表
     */
    formatTreeData (list) {
      const data = []
      list.forEach(item => {
        // 新的元素
        const netItem = {
          title: item.name,
          key: item.group_id,
          value: item.group_id
        }
        // 递归整理子集
        if (item.children && item.children.length) {
          netItem['children'] = this.formatTreeData(item['children'])
        }
        data.push(netItem)
      })
      return data
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
      this.onDelete([item['file_id']])
    },

    // 批量删除
    handleBatchDelete () {
      this.onDelete(this.selectedRowKeys)
    },

    /**
     * 执行删除
     */
    onDelete (fileIds) {
      const that = this
      const modal = this.$confirm({
        title: '您确定要删除该文件吗?',
        content: '删除后不可恢复，请谨慎操作',
        onOk () {
          return Api.deleted({ fileIds })
            .then(result => {
              that.$message.success(result.message, 1.5)
              that.handleRefresh()
            })
            .catch(() => true)
            .finally(result => modal.destroy())
        }
      })
    },

    /**
     * 批量移动文件
     */
    handleBatchMove () {
      this.$refs.MoveGroupForm.show(this.selectedRowKeys)
    },

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = true) {
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
// 预览图
.preview-box {
  width: 120px;
  height: 80px;
  line-height: 80px;
  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>

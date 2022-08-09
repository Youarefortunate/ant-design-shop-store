<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <div class="table-operator">
      <!-- 搜索板块 -->
      <a-row class="row-item-search">
        <a-form class="search-form" :form="searchForm" layout="inline" @submit="handleSearch">
          <a-form-item label="会员昵称">
            <a-input v-decorator="['search']" placeholder="请输入会员昵称" />
          </a-form-item>
          <a-form-item label="余额变动场景">
            <a-select v-decorator="['scene', { initialValue: 0 }]">
              <a-select-option :value="0">全部</a-select-option>
              <a-select-option
                v-for="(item, index) in SceneEnum.data"
                :key="index"
                :value="item.value"
              >{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="变动时间">
            <a-range-picker format="YYYY-MM-DD" v-decorator="['betweenTime']" />
          </a-form-item>
          <a-form-item class="search-btn">
            <a-button type="primary" icon="search" html-type="submit">搜索</a-button>
          </a-form-item>
        </a-form>
      </a-row>
    </div>
    <s-table
      ref="table"
      rowKey="log_id"
      :loading="isLoading"
      :columns="columns"
      :data="loadData"
      :pageSize="15"
    >
      <!-- 会员信息 -->
      <span slot="user" slot-scope="text">
        <UserItem :user="text" />
      </span>
      <!-- 余额变动场景 -->
      <span slot="scene" slot-scope="text">
        <a-tag>{{ SceneEnum[text].name }}</a-tag>
      </span>
    </s-table>
  </a-card>
</template>

<script>
import * as Api from '@/api/user/balance'
import { STable, UserItem } from '@/components/Table'
import SceneEnum from '@/common/enum/user/balance/log/Scene'

export default {
  name: 'Index',
  components: {
    STable,
    UserItem
  },
  data () {
    return {
      // 枚举类
      SceneEnum,
      // 当前表单元素
      searchForm: this.$form.createForm(this),
      // 查询参数
      queryParam: {},
      // 正在加载
      isLoading: false,
      // 表头
      columns: [
        {
          title: 'ID',
          dataIndex: 'log_id'
        },
        {
          title: '会员信息',
          dataIndex: 'user',
          scopedSlots: { customRender: 'user' }
        },
        {
          title: '余额变动场景',
          dataIndex: 'scene',
          scopedSlots: { customRender: 'scene' }
        },
        {
          title: '变动金额',
          dataIndex: 'money'
        },
        {
          title: '描述/说明',
          dataIndex: 'describe'
        },
        {
          title: '管理员备注',
          dataIndex: 'remark'
        },
        {
          title: '变动时间',
          dataIndex: 'create_time'
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.log({ ...param, ...this.queryParam })
          .then(response => {
            return response.data.list
          })
      }
    }
  },
  created () {

  },
  methods: {

    /**
     * 刷新列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = false) {
      this.$refs.table.refresh(bool)
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
    }

  }
}
</script>

<style lang="less" scoped>
.ant-card-body {
  padding: 22px 29px 25px;
}
</style>

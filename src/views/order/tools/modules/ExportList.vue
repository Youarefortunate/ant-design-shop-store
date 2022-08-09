<template>
  <s-table
    ref="table"
    rowKey="id"
    :loading="isLoading"
    :columns="columns"
    :data="loadData"
    :pageSize="10"
  >
    <!-- 下单时间 -->
    <template slot="time" slot-scope="item">
      <span>{{ item.start_time }}</span>
      <span class="ml-5 mr-5">到</span>
      <span>{{ item.end_time }}</span>
    </template>
    <!-- 导出状态 -->
    <template slot="status" slot-scope="text">
      <a-tag :color="ExportStatusColorEnum[text]">{{ ExportStatusEnum[text].name }}</a-tag>
    </template>
    <!-- 操作 -->
    <span class="actions" slot="action" slot-scope="text, item">
      <a
        v-if="item.status === ExportStatusEnum.COMPLETED.value"
        v-action:download
        :href="item.download_url"
        target="_blank"
      >下载</a>
    </span>
  </s-table>
</template>

<script>
import { STable } from '@/components'
import * as Api from '@/api/order/export'
import { ExportStatusEnum } from '@/common/enum/order/export'

const ExportStatusColorEnum = {
  [ExportStatusEnum.NORMAL.value]: '',
  [ExportStatusEnum.COMPLETED.value]: 'green',
  [ExportStatusEnum.FAIL.value]: 'red',
}

// 订单导出记录组件
export default {
  name: 'ExportList',
  components: {
    STable
  },

  data () {
    return {
      // 正在加载
      isLoading: false,
      // 枚举类
      ExportStatusEnum,
      ExportStatusColorEnum,
      // 表头
      columns: [
        {
          title: '记录ID',
          dataIndex: 'id'
        },
        {
          title: '下单时间',
          scopedSlots: { customRender: 'time' }
        },
        {
          title: '导出时间',
          dataIndex: 'create_time'
        },
        {
          title: '导出状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '操作',
          width: '180px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: param => {
        return Api.list(param).then(response => response.data.list)
      }
    }
  },
  watch: {
    value: {
      // 首次加载的时候执行函数
      immediate: true,
      handler (val) {
        this.imgUrl = val
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

  }
}
</script>

<style lang="less" scoped>
</style>

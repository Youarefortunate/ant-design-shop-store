<template>
  <a-spin :spinning="isLoading">
    <div class="container">
      <!-- 数据概况 -->
      <a-card class="overview" :bordered="false">
        <div class="card-title">
          <span>数据概况</span>
        </div>
        <div class="screen flex flex-x-center">
          <a-range-picker v-model="dateValue" format="YYYY-MM-DD" @change="onPickerChange" />
          <!-- 快捷选项 -->
          <div class="shortcut">
            <div class="shortcut-days">
              <a href="javascript:void(0);" @click="handleFastDate(7)">7天</a>
              <a href="javascript:void(0);" @click="handleFastDate(30)">30天</a>
              <a href="javascript:void(0);" @click="handleFastDate(0)">清空</a>
            </div>
          </div>
        </div>
        <a-row class="mt-20" :gutter="32">
          <a-col class :span="8">
            <div class="item flex">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.overview.sale" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">销售额 (元)</p>
                <p class="value">{{ data.overview.orderTotalPrice }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="8">
            <div class="item flex">
              <div class="col-left small">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.statistics.order" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">支付订单数 (笔)</p>
                <p class="value">{{ data.overview.orderTotal }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="8">
            <div class="item flex">
              <div class="col-left small">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.statistics.goods" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">商品数量 (件)</p>
                <p class="value">{{ data.overview.goodsTotal }}</p>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row class="mt-20" :gutter="32">
          <a-col class :span="8">
            <div class="item flex">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.statistics.user" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">会员数量</p>
                <p class="value">{{ data.overview.userTotal }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="8">
            <div class="item flex">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.statistics.consume" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">消费人数</p>
                <p class="value">{{ data.overview.consumeUsers }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="8">
            <div class="item flex">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.statistics.recharge" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">用户充值总额 (元)</p>
                <p class="value">{{ data.overview.rechargeTotalMoney }}</p>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 近七日交易走势 -->
      <a-card class="trade-trend mt-20" :bordered="false">
        <div class="card-title">
          <span>近七日交易走势</span>
        </div>
        <div class="echarts-body">
          <div id="main" style="width: 100%; height: 400px;"></div>
        </div>
      </a-card>

      <a-row class="ranking mt-20" :gutter="32">
        <a-col class="ranking-item" :span="12">
          <a-card :bordered="false">
            <div class="card-title">
              <span>商品销售榜</span>
            </div>
            <a-table
              rowKey="goods_id"
              :columns="goodsRankingColumns"
              :dataSource="data.goodsRanking"
              :pagination="false"
            >
              <template slot="index" slot-scope="text, item, index">
                <div v-if="index < 3 && item.total_sales_num > 0" class="ranking-img">
                  <img :src="`static/img/statistics/ranking/0${ index + 1 }.png`" alt />
                </div>
                <span v-else>{{ index + 1 }}</span>
              </template>
              <template slot="goods_name" slot-scope="text">
                <p class="oneline-hide" style="width: 240px;">{{ text }}</p>
              </template>
            </a-table>
          </a-card>
        </a-col>
        <a-col class="ranking-item" :span="12">
          <a-card :bordered="false">
            <div class="card-title">
              <span>用户消费榜</span>
            </div>
            <a-table
              rowKey="user_id"
              :columns="userRankingColumns"
              :dataSource="data.userExpendRanking"
              :pagination="false"
            >
              <template slot="index" slot-scope="text, item, index">
                <div v-if="index < 3 && item.expend_money > 0" class="ranking-img">
                  <img :src="`static/img/statistics/ranking/0${ index + 1 }.png`" alt />
                </div>
                <span v-else>{{ index + 1 }}</span>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>

<script>
import echarts from 'echarts'
import 'echarts/theme/fresh-cut'
import * as Api from '@/api/statistics/data'
import * as Icons from './modules/icon'
import { getDateByDay } from '@/utils/util'
import moment from 'moment'

// 商品销售榜 (table字段)
const goodsRankingColumns = [
  {
    title: '排名',
    dataIndex: 'index',
    align: 'center',
    scopedSlots: { customRender: 'index' }
  },
  {
    title: '商品名称',
    dataIndex: 'goods_name',
    scopedSlots: { customRender: 'goods_name' }
  },
  {
    title: '销量 (件)',
    align: 'center',
    dataIndex: 'total_sales_num'
  },
  {
    title: '销售额 (元)',
    align: 'center',
    dataIndex: 'sales_volume'
  }
]

// 用户消费榜 (table字段)
const userRankingColumns = [
  {
    title: '排名',
    dataIndex: 'index',
    align: 'center',
    scopedSlots: { customRender: 'index' }
  },
  {
    title: '会员昵称',
    dataIndex: 'nick_name',
    scopedSlots: { customRender: 'nick_name' }
  },
  {
    title: '实际消费金额 (元)',
    align: 'center',
    dataIndex: 'expend_money'
  }
]

// 默认数据
const data = {
  overview: {
    userTotal: '0',
    consumeUsers: '0',
    orderTotal: '0',
    orderTotalPrice: '0.00',
    goodsTotal: '0',
    rechargeTotalMoney: '0'
  },
  tradeTrend: {
    date: [],
    orderTotal: [],
    orderTotalPrice: []
  },
  goodsRanking: [],
  userExpendRanking: []
}

export default {
  name: 'Index',
  data () {
    return {
      Icons,
      // 正在提交
      isLoading: false,
      // 页面数据
      data,
      // 日期筛选
      dateValue: [],
      // 排行榜字段
      goodsRankingColumns,
      userRankingColumns
    }
  },
  created () {
    // 获取页面数据
    this.getData()
  },
  methods: {

    // 监听事件：日期选择器
    onPickerChange () {
      // 获取数据概况
      this.getSurvey()
    },

    // 事件: 快捷选择日期
    handleFastDate (days) {
      // 清空日期
      if (days === 0) {
        this.dateValue = []
      } else {
        this.dateValue = [moment(getDateByDay(-days)), moment(getDateByDay(0))]
      }
      // 获取数据概况
      this.getSurvey()
    },

    // 获取数据概况
    getSurvey () {
      this.isLoading = true
      const { dateValue } = this
      const data = { startDate: null, endDate: null }
      if (dateValue.length) {
        data.startDate = dateValue[0].format('YYYY-MM-DD')
        data.endDate = dateValue[1].format('YYYY-MM-DD')
      }
      Api.survey(data)
        .then(result => {
          this.data.overview = result.data
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    // 获取页面数据
    getData () {
      this.isLoading = true
      Api.data()
        .then(result => {
          this.data = result.data.data
          // 渲染走势图
          this.$nextTick(() => {
            this.myEcharts()
          })
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    // 渲染走势图
    myEcharts () {
      const { data } = this
      // 基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'), 'fresh-cut')

      // 指定图表的配置项和数据
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['成交量', '成交额']
        },
        toolbox: {
          show: true,
          showTitle: false,
          feature: {
            mark: { show: true },
            magicType: { show: true, type: ['line', 'bar'] }
          }
        },
        calculable: true,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.tradeTrend.date
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '成交额',
            type: 'line',
            data: data.tradeTrend.orderTotalPrice
          },
          {
            name: '成交量',
            type: 'line',
            data: data.tradeTrend.orderTotal
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    }
  }
}
</script>
<style lang="less" scoped>
.card-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
}
// 实时概况
.overview {
  a {
    color: unset;

    &:hover {
      color: #1890ff;
    }
  }

  .screen {
    margin-top: -22px;
    margin-bottom: 30px;
    text-align: center;
    .shortcut-days {
      margin-left: 10px;
      line-height: 32px;
      a {
        margin: 0 3px;
      }
    }
  }

  .item {
    padding: 13px 20px;
  }

  .col-left {
    color: #66aaff;
    font-size: 28px;
    margin-right: 35px;
    &.small {
      font-size: 26px;
    }

    .icon-body {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background-color: #eff6ff;
    }
  }

  .col-right {
    .name {
      font-size: @font-size-base;
      color: #666;
    }

    .value {
      color: #000;
      font-size: 24px;
    }

    .yesterday {
      display: none;
      font-size: 12px;
      color: #999;
    }
  }
}

.ranking-img {
  text-align: center;
}
</style>

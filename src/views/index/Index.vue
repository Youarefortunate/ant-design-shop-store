<template>
  <a-spin :spinning="isLoading">
    <div class="container">
      <!-- 实时概况 -->
      <a-card class="overview" :bordered="false">
        <div class="card-title">
          <span>实时概况</span>
        </div>
        <a-row :gutter="32">
          <a-col class :span="6">
            <div class="item flex">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.overview.sale" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">销售额 (元)</p>
                <p class="value">{{ data.overview.orderTotalPrice.tday }}</p>
                <p class="yesterday">昨日：{{ data.overview.orderTotalPrice.yday }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="6">
            <div class="item flex">
              <div class="col-right">
                <p class="name">支付订单数</p>
                <p class="value">{{ data.overview.orderTotal.tday }}</p>
                <p class="yesterday">昨日：{{ data.overview.orderTotal.yday }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="6">
            <div class="item flex">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon :component="Icons.overview.increase" />
                </div>
              </div>
              <div class="col-right">
                <p class="name">新增会员数</p>
                <p class="value">{{ data.overview.newUserTotal.tday }}</p>
                <p class="yesterday">昨日：{{ data.overview.newUserTotal.yday }}</p>
              </div>
            </div>
          </a-col>
          <a-col class :span="6">
            <div class="item flex">
              <div class="col-right">
                <p class="name">付款会员数</p>
                <p class="value">{{ data.overview.consumeUserTotal.tday }}</p>
                <p class="yesterday">昨日：{{ data.overview.consumeUserTotal.yday }}</p>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 统计 -->
      <a-row class="statistics mt-20" :gutter="32">
        <a-col class="item" :span="6">
          <a-card :bordered="false">
            <div class="flex flex-y-center">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon class="icon" :component="Icons.statistics.goods" />
                </div>
              </div>
              <div class="col-right">
                <p class="info">商品总数量</p>
                <p class="keynote">{{ data.statistics.goodsTotal }}</p>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col class="item" :span="6">
          <a-card :bordered="false">
            <div class="flex flex-y-center">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon class="icon" :component="Icons.statistics.user" />
                </div>
              </div>
              <div class="col-right">
                <p class="info">会员总人数</p>
                <p class="keynote">{{ data.statistics.userTotal }}</p>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col class="item" :span="6">
          <a-card :bordered="false">
            <div class="flex flex-y-center">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon class="icon" :component="Icons.statistics.order" />
                </div>
              </div>
              <div class="col-right">
                <p class="info">付款订单总量</p>
                <p class="keynote">{{ data.statistics.orderTotal }}</p>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col class="item" :span="6">
          <a-card :bordered="false">
            <div class="flex flex-y-center">
              <div class="col-left">
                <div class="icon-body flex flex-x-center flex-y-center">
                  <a-icon class="icon" :component="Icons.statistics.consume" />
                </div>
              </div>
              <div class="col-right">
                <p class="info">消费总人数</p>
                <p class="keynote">{{ data.statistics.consumeUserTotal }}</p>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 待办事项 -->
      <a-card class="pending mt-20" :bordered="false">
        <a-row :gutter="32">
          <a-col :span="6">
            <div class="item">
              <router-link to="/order/list/delivery">
                <p class="name">待发货订单(笔)</p>
                <p class="value">{{ data.pending.deliverOrderTotal }}</p>
              </router-link>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="item">
              <router-link to="/order/refund/index">
                <p class="name">售后单(笔)</p>
                <p class="value">{{ data.pending.refundTotal }}</p>
              </router-link>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="item">
              <router-link to="/order/list/pay">
                <p class="name">待付款订单(笔)</p>
                <p class="value">{{ data.pending.paidOrderTotal }}</p>
              </router-link>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="item">
              <router-link :to="{ path: '/goods/index', query: { listType: 'sold_out' } }">
                <p class="name">已售罄商品</p>
                <p class="value">{{ data.pending.soldoutGoodsTotal }}</p>
              </router-link>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 常用功能 -->
      <a-card class="functions mt-20" :bordered="false">
        <div class="card-title">
          <span>常用功能</span>
        </div>
        <a-row :gutter="32">
          <a-col class :span="6" v-for="(item, index) in functions" :key="index">
            <div class="item" @click="handleLink(item.link)">
              <div class="flex flex-y-center">
                <div
                  class="icon flex flex-x-center flex-y-center"
                  :style="{ backgroundColor: item.color }"
                >
                  <a-icon :component="item.icon" />
                </div>
                <span class="name">{{ item.name }}</span>
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
    </div>
  </a-spin>
</template>

<script>
import echarts from 'echarts'
import 'echarts/theme/fresh-cut'
import * as Api from '@/api/home'
import * as Icons from './modules/icon'

// 常用功能
const functions = [
  {
    name: '发布商品',
    icon: Icons.functions.goods,
    color: '#00BF57',
    link: '/goods/create'
  },
  {
    name: '店铺装修',
    icon: Icons.functions.decorate,
    color: '#f15858',
    link: '/page/index'
  },
  {
    name: '会员管理',
    icon: Icons.functions.user,
    color: '#139dff',
    link: '/user/index'
  },
  {
    name: '订单管理',
    icon: Icons.functions.order,
    color: '#139dff',
    link: '/order/list/all'
  },
  {
    name: '售后管理',
    icon: Icons.functions.refund,
    color: '#139dff',
    link: '/order/refund/index'
  },
  {
    name: '优惠券',
    icon: Icons.functions.coupon,
    color: '#f15858',
    link: '/market/coupon/index'
  },
  {
    name: '数据统计',
    icon: Icons.functions.statistics,
    color: '#139dff',
    link: '/statistics'
  }
]

const data = {
  overview: {
    orderTotalPrice: {
      tday: '0.00',
      ytd: '0.00'
    },
    orderTotal: {
      tday: '0',
      ytd: '0'
    },
    newUserTotal: {
      tday: '0',
      ytd: '0'
    },
    consumeUserTotal: {
      tday: '0',
      ytd: '0'
    }
  },
  statistics: {
    goodsTotal: '0',
    userTotal: '0',
    orderTotal: '0',
    consumeUserTotal: '0'
  },
  pending: {
    deliverOrderTotal: 0,
    refundTotal: 0,
    paidOrderTotal: 0,
    soldoutGoodsTotal: 0
  },
  tradeTrend: {
    date: [],
    orderTotal: [],
    orderTotalPrice: []
  }
}

export default {
  name: 'Index',
  data () {
    return {
      Icons,
      functions,
      // 正在提交
      isLoading: false,
      // 首页数据
      data
    }
  },
  created () {
    // 获取首页数据
    this.getData()
  },
  methods: {

    // 获取首页数据
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

    // 跳转到指定link
    handleLink (link) {
      const app = this
      if (!app.$auth(link)) {
        app.$message.info('很抱歉，没有该页面的访问权限')
        return false
      }
      app.$router.push(link)
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

// 统计
.statistics {
  line-height: 1;

  .ant-card {
    .ant-card-body {
      height: 100%;
      padding: 30px 40px;
    }
  }

  .col-left {
    margin-right: 25px;
    font-size: 24px;
    color: #4799ff;

    .icon-body {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background-color: #eff6ff;
    }
  }

  .col-right {
    margin-top: -5px;

    .keynote {
      font-size: 26px;
    }
  }
}

// 待办事项
.pending {
  text-align: center;
  padding: 15px 0;

  .item {
    display: inline-block;
    padding: 0 20px;

    a {
      color: unset;
      // &就代表应用父级元素
      &:hover {
        color: #1890ff;
      }
    }
  }

  .name {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 13.6px;
  }

  .value {
    font-weight: bold;
    color: red;
    font-size: 16px;
  }
}

// 常用功能
.functions {
  .item {
    display: block;
    padding: 13px 20px;
    cursor: pointer;
    &:hover {
      color: #1890ff;
    }
  }

  .name {
    font-size: @font-size-base;
    margin-left: 10px;
  }

  .icon {
    width: 28px;
    height: 28px;
    // background   : #139dff !important;
    color: #fff;
    font-size: @font-size-base;
    border-radius: 5px;
  }
}

// 实时概况
.overview {
  a {
    color: unset;

    &:hover {
      color: #1890ff;
    }
  }

  .item {
    padding: 13px 20px;
  }

  .col-left {
    color: #4799ff;
    font-size: 28px;
    margin-right: 35px;

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
</style>

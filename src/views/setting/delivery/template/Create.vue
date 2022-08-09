<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-spin :spinning="isLoading">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item label="模版名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            placeholder="请输入模版名称"
            v-decorator="['name', {rules: [{required: true, min: 2, message: '请输入至少2个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="计费方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group
            @change="onChangemMethod"
            v-decorator="['method', {initialValue: 10, rules: [{required: true}]}]"
          >
            <a-radio :value="10">按件数</a-radio>
            <a-radio :value="20">按重量</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="配送区域及运费" :labelCol="labelCol" :wrapperCol="{ span: 15 }" required>
          <a-table
            v-show="ruleList.length"
            class="table-rules"
            :columns="columns"
            :dataSource="ruleList"
            :pagination="false"
            bordered
          >
            <!-- 可配送区域 -->
            <template slot="region_text" slot-scope="text, item, index">
              <p class="content">
                <span v-for="(province, pidx) in text" :key="pidx">
                  <span>{{ province.name }}</span>
                  <template v-if="province.citys.length">
                    <span>(</span>
                    <span
                      class="city-name"
                      v-for="(city, cidx) in province.citys"
                      :key="cidx"
                    >{{ city.name }}{{ province.citys.length > cidx + 1 ? '、': '' }}</span>
                    <span>)</span>
                  </template>
                  <span>{{ ' ' }}</span>
                </span>
              </p>
              <p class="operation">
                <a href="javascript:void(0);" class="edit" @click="handleEdit(index, item)">编辑</a>
                <a href="javascript:void(0);" class="delete" @click="handleDelete(index)">删除</a>
              </p>
            </template>
            <!-- 首件 (个) -->
            <template slot="first" slot-scope="text, item">
              <a-input-number
                v-model="item.first"
                :min="method == 10 ? 1 : 0.01"
                :precision="method == 10 ? 0 : 2"
              />
            </template>
            <!-- 首运费(元) -->
            <template slot="first_fee" slot-scope="text, item">
              <a-input-number v-model="item.first_fee" :min="0" :precision="2" />
            </template>
            <!-- 续件 (个) -->
            <template slot="additional" slot-scope="text, item">
              <a-input-number v-model="item.additional" :min="0" :precision="method == 10 ? 0 : 2" />
            </template>
            <!-- 续费(元) -->
            <template slot="additional_fee" slot-scope="text, item">
              <a-input-number v-model="item.additional_fee" :min="0" :precision="2" />
            </template>
          </a-table>
          <a-button icon="environment" @click="handleAdd">点击添加配送区域</a-button>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="数字越小越靠前">
          <a-input-number
            :min="0"
            v-decorator="['sort', {initialValue: 100, rules:[{required: true, message: '请输入排序值'}]}]"
          />
        </a-form-item>
        <a-form-item class="mt-20" :wrapper-col="{ span: wrapperCol.span, offset: labelCol.span }">
          <a-button type="primary" html-type="submit" :loading="isBtnLoading">提交</a-button>
        </a-form-item>
      </a-form>
      <AreasModal ref="AreasModal" @handleSubmit="handleAreaSubmit" />
    </a-spin>
  </a-card>
</template>

<script>
import { AreasModal } from '@/components/Modal'
import * as Api from '@/api/setting/delivery'
import Region from '@/common/model/Region'

const defaultItem = {
  key: 0,
  first: 1,
  first_fee: 0,
  additional: 0,
  additional_fee: 0,
  region: [],
  region_text: []
}

export default {
  components: {
    AreasModal
  },
  data () {
    return {
      // table字段
      columns: [
        {
          title: '可配送区域',
          dataIndex: 'region_text',
          width: '400px',
          scopedSlots: { customRender: 'region_text' }
        },
        {
          title: '首件 (个)',
          dataIndex: 'first',
          scopedSlots: { customRender: 'first' }
        },
        {
          title: '运费(元)',
          dataIndex: 'first_fee',
          scopedSlots: { customRender: 'first_fee' }
        },
        {
          title: '续件 (个)',
          dataIndex: 'additional',
          scopedSlots: { customRender: 'additional' }
        },
        {
          title: '续费(元)',
          dataIndex: 'additional_fee',
          scopedSlots: { customRender: 'additional_fee' }
        }
      ],
      // table内容
      ruleList: [],
      // 正在加载
      isLoading: false,
      isBtnLoading: false,
      // 标签布局属性
      labelCol: { span: 3 },
      // 输入框布局属性
      wrapperCol: { span: 10 },
      // 当前表单元素
      form: this.$form.createForm(this),
      // 计费方式
      method: 10,
      // 城市总数
      citysCount: null
    }
  },
  created () {
    // 城市总数
    Region.getCitysCount().then(count => {
      this.citysCount = count
    })
  },
  methods: {

    // 更改计费方式
    onChangemMethod (e) {
      this.method = e.target.value
      const text = {
        10: { first: '首件 (个)', additional: '续件 (个)' },
        20: { first: '首重 (Kg)', additional: '续重 (Kg)' }
      }
      this.columns[1].title = text[this.method].first
      this.columns[3].title = text[this.method].additional
    },

    // 新增记录
    handleAdd () {
      const index = this.ruleList.length
      const newItem = { ...defaultItem, key: index }
      // 排除的城市id集(已存在的城市id集)
      const excludedCityIds = this.getExcludedCityIds()
      if (excludedCityIds.length === this.citysCount) {
        this.$message.error('已选择了所有的区域', 0.8)
        return false
      }
      // 显示选择地区对话框
      this.handleAreasModal('add', index, newItem, excludedCityIds)
    },

    // 编辑记录
    handleEdit (index, item) {
      // 排除的城市id集(已存在的城市id集)
      const excludedCityIds = this.getExcludedCityIds()
      // 显示选择地区对话框
      this.handleAreasModal('edit', index, item, excludedCityIds)
    },

    // 显示选择地区对话框
    handleAreasModal (scene, index, item, excludedCityIds) {
      this.$refs.AreasModal.handle({ scene, index, item }, item.region, excludedCityIds)
    },

    // 排除的城市id集(已存在的城市id集)
    getExcludedCityIds () {
      const excludedCityIds = []
      this.ruleList.forEach(item => {
        item.region.forEach(cityId => {
          excludedCityIds.push(cityId)
        })
      })
      return excludedCityIds
    },

    // 选择地区后的回调
    handleAreaSubmit (result) {
      const { custom: { scene, item } } = result
      item.region = result.selectedCityIds
      item.region_text = result.selectedText
      if (scene === 'add') {
        this.ruleList.push(item)
      }
    },

    // 删除记录
    handleDelete (index) {
      const app = this
      const modal = this.$confirm({
        title: '您确定要删除该记录吗?',
        onOk () {
          app.ruleList.splice(index, 1)
          modal.destroy()
        }
      })
    },

    /**
     * 确认按钮
     */
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields }, ruleList } = this
      validateFields((errors, values) => {
        if (errors) {
          return false
        }
        if (ruleList.length === 0) {
          this.$message.error('您还没有添加配送区域及运费', 0.8)
          return false
        }
        // 提交到后端api
        values.rules = ruleList
        this.onFormSubmit(values)
      })
    },

    /**
    * 提交到后端api
    */
    onFormSubmit (values) {
      this.isLoading = true
      this.isBtnLoading = true
      Api.add({ form: values })
        .then(result => {
          // 显示提示信息
          this.$message.success(result.message, 1.5)
          // 跳转到列表页
          setTimeout(() => {
            this.$router.push('./index')
          }, 1500)
        })
        .catch(() => {
          this.isBtnLoading = false
        })
        .finally(result => {
          this.isLoading = false
        })
    }

  }
}
</script>
<style lang="less">
.table-rules {
  .operation {
    text-align: right;
    a {
      font-size: @font-size-base;
      margin-left: 6px;
    }
  }
  .content {
    color: #505050;
    white-space: normal;
    .city-name {
      font-size: 12.5px;
      color: #7b7b7b;
    }
  }
}
</style>

<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-spin :spinning="isLoading">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item label="积分名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['points_name', { rules: [{ required: true, message: '请输入积分名称' }] }]"
          />
          <div class="form-item-help">
            <small>注：商家使用自定义的积分名称来做品牌运营。如京东把积分称为“京豆”，淘宝把积分称为“淘金币”</small>
          </div>
        </a-form-item>
        <a-form-item label="积分说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea
            :autoSize="{ minRows: 4 }"
            v-decorator="['describe', { rules: [{ required: true, message: '请输入积分说明' }] }]"
          />
        </a-form-item>

        <a-divider orientation="left">积分赠送</a-divider>
        <a-form-item label="购物送积分" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group
            v-decorator="['is_shopping_gift', { initialValue: 1, rules: [{ required: true }] }]"
          >
            <a-radio :value="1">开启</a-radio>
            <a-radio :value="0">关闭</a-radio>
          </a-radio-group>
          <div class="form-item-help">
            <small>积分赠送规则：1. 订单确认收货已完成； 2. 已完成订单超出后台设置的申请售后期限</small>
          </div>
        </a-form-item>
        <div v-show="form.getFieldValue('is_shopping_gift') == 1">
          <a-form-item label="积分赠送比例" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number
              :min="0.1"
              :max="100"
              :precision="1"
              v-decorator="['gift_ratio', { rules: [{ required: true, message: '请输入积分赠送比例' }] }]"
            />
            <span class="ml-10">%</span>
            <div class="form-item-help">
              <p class="extra">注：赠送比例请填写数字0~100；订单的运费不参与积分赠送</p>
              <p class="extra">例：订单付款金额(100.00元) * 积分赠送比例(100%) = 实际赠送的积分(100积分)</p>
            </div>
          </a-form-item>
        </div>

        <a-divider orientation="left">积分抵扣</a-divider>
        <a-form-item label="下单使用积分抵扣" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group
            v-decorator="['is_shopping_discount', { initialValue: 1, rules: [{ required: true }] }]"
          >
            <a-radio :value="1">开启</a-radio>
            <a-radio :value="0">关闭</a-radio>
          </a-radio-group>
          <div class="form-item-help">
            <small>注：如开启则用户下单时可选择使用积分抵扣订单金额</small>
          </div>
        </a-form-item>

        <div v-show="form.getFieldValue('is_shopping_discount') == 1">
          <a-form-item label="积分抵扣比例" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <InputNumberGroup
              addonBefore="1个积分可抵扣"
              addonAfter="元"
              :inputProps="{ min: 0.01, precision: 2 }"
              v-decorator="['discount.discount_ratio', { rules: [{ required: true, message: '积分抵扣比例不能为空' }] }]"
            />
            <div class="form-item-help">
              <small>例如：设置1个积分可抵扣0.1元，则10积分可抵扣1元，100积分可抵扣10元</small>
            </div>
          </a-form-item>
          <a-form-item label="最高可抵扣金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-form-item>
              <InputNumberGroup
                addonBefore="订单满"
                addonAfter="元"
                :inputProps="{ min: 0.01, precision: 2 }"
                v-decorator="['discount.full_order_price', { rules: [{ required: true, message: '抵扣条件不能为空' }] }]"
              />
            </a-form-item>
            <a-form-item>
              <InputNumberGroup
                addonBefore="最高可抵扣金额"
                addonAfter="%"
                :inputProps="{ min: 0.1, max: 90, precision: 1 }"
                v-decorator="['discount.max_money_ratio', { rules: [{ required: true, message: '最高可抵扣金额不能为空' }] }]"
              />
              <div class="form-item-help">
                <small>例如：设置最高可抵扣10%，订单金额100元，此时用户可抵扣10元</small>
              </div>
            </a-form-item>
          </a-form-item>
        </div>
        <a-form-item :wrapper-col="{ span: wrapperCol.span, offset: labelCol.span }">
          <a-button type="primary" html-type="submit">提交</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import * as Api from '@/api/setting/store'
import { InputNumberGroup } from '@/components'

export default {
  components: {
    InputNumberGroup
  },
  data () {
    return {
      // 当前设置项的key
      key: 'points',
      // 标签布局属性
      labelCol: { span: 4 },
      // 输入框布局属性
      wrapperCol: { span: 10 },
      // loading状态
      isLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 当前记录详情
      record: {}
    }
  },
  // 初始化数据
  created () {
    // 获取当前详情记录
    this.getDetail()
  },
  methods: {

    // 获取当前详情记录
    getDetail () {
      this.isLoading = true
      Api.detail(this.key)
        .then(result => {
          // 当前记录
          this.record = result.data.values
          // 设置默认值
          this.setFieldsValue()
        })
        .finally(result => {
          this.isLoading = false
        })
    },

    /**
     * 设置默认值
     */
    setFieldsValue () {
      const { record, $nextTick, form: { setFieldsValue } } = this
      $nextTick(() => {
        setFieldsValue(pick(record, [
          'points_name', 'describe',
          'is_shopping_gift', 'gift_ratio',
          'is_shopping_discount', 'discount'
        ]))
      })
    },

    /**
     * 确认按钮
     */
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        // 提交到后端api
        !errors && this.onFormSubmit(values)
      })
    },

    /**
    * 提交到后端api
    */
    onFormSubmit (values) {
      this.isLoading = true
      Api.update(this.key, { form: values })
        .then((result) => {
          // 显示提示信息
          this.$message.success(result.message, 1.5)
        })
        .finally((result) => {
          this.isLoading = false
        })
    }

  }
}
</script>
<style lang="less" scoped>
.ant-form-item {
  .ant-form-item {
    margin-bottom: 0;
  }
}

/deep/.ant-form-item-control {
  padding-left: 10px;
  .ant-form-item-control {
    padding-left: 0;
  }
}
</style>

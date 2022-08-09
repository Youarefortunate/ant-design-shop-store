<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-spin :spinning="isLoading">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item
          label="配送方式"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="用户下单时可以选择的配送方式"
        >
          <a-checkbox-group
            v-decorator="['delivery_type', {rules: [{required: true, message: '配送方式至少选择一个'}]}]"
          >
            <a-checkbox :value="10">快递配送</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-divider orientation="left">物流查询API</a-divider>
        <a-form-item label="快递100 Customer" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['kuaidi100.customer']" />
          <div class="form-item-help">
            <small style="margin-right: 6px;">用于查询快递/物流信息，需快递100企业版API</small>
            <a href="https://api.kuaidi100.com/home" target="_blank">去申请</a>
          </div>
        </a-form-item>
        <a-form-item label="快递100 Key" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['kuaidi100.key']" />
        </a-form-item>
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
import { isEmpty } from '@/utils/util'

export default {
  data () {
    return {
      // 当前设置项的key
      key: 'delivery',
      // 标签布局属性
      labelCol: { span: 3 },
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
      const { record, $nextTick, form } = this
      !isEmpty(form.getFieldsValue()) && $nextTick(() => {
        form.setFieldsValue(pick(record, ['delivery_type', 'kuaidi100']))
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
/deep/.ant-form-item-control {
  padding-left: 10px;

  .ant-form-item-control {
    padding-left: 0;
  }
}
.ant-divider {
  margin-top: 50px !important;
}
</style>

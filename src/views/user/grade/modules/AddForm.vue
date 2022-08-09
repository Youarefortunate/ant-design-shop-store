<template>
  <a-modal
    :title="title"
    :width="720"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          label="等级名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="例如：大众会员、黄金会员、铂金会员、钻石会员"
        >
          <a-input v-decorator="['name', {rules: [{required: true, message: '请输入等级名称'}]}]" />
        </a-form-item>
        <a-form-item
          label="等级权重"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="会员等级的权重，数字越大 等级越高"
        >
          <a-select v-decorator="['weight', {rules: [{required: true, message: '请选择等级权重'}]}]">
            <a-select-option
              v-for="(value, index) in weights"
              :key="index"
              :value="value"
            >{{ value }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="升级条件" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <InputNumberGroup
            addonBefore="实际消费金额满"
            addonAfter="元"
            :inputProps="{ min: 0.01 }"
            v-decorator="['upgrade.expend_money', { rules: [{ required: true, message: '升级条件不能为空' }] }]"
          />
          <div class="form-item-help">
            <p class="extra">用户的实际消费金额满足后，自动升级</p>
          </div>
        </a-form-item>
        <a-form-item label="等级权益" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <InputNumberGroup
            addonBefore="折扣率"
            addonAfter="折"
            :inputProps="{ min: 0, max: 9.9 }"
            v-decorator="['equity.discount', { rules: [{ required: true, message: '等级权益不能为空' }] }]"
          />
          <div class="form-item-help">
            <p class="extra">折扣率范围0.0-9.9，例如: 9.8代表98折，0代表不折扣</p>
          </div>
        </a-form-item>
        <a-form-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['status', {initialValue: 1, rules: [{required: true}]}]">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="数字越小越靠前">
          <a-input-number
            :min="0"
            v-decorator="['sort', {initialValue: 100, rules: [{required: true, message: '请输入排序值'}]}]"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import * as Api from '@/api/user/grade'
import { InputNumberGroup } from '@/components'

// 生成等级权重
const weights = []
for (let i = 1; i <= 20; i++) {
  weights.push(i)
}

export default {
  components: {
    InputNumberGroup
  },
  data () {
    return {
      // 对话框标题
      title: '新增会员等级',
      // 标签布局属性
      labelCol: { span: 7 },
      // 输入框布局属性
      wrapperCol: { span: 13 },
      // modal(对话框)是否可见
      visible: false,
      // modal(对话框)确定按钮 loading
      confirmLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 等级权重
      weights
    }
  },
  created () {

  },
  methods: {

    /**
     * 显示对话框
     */
    add () {
      // 显示窗口
      this.visible = true
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
     * 关闭对话框事件
     */
    handleCancel () {
      this.visible = false
      this.form.resetFields()
    },

    /**
    * 提交到后端api
    */
    onFormSubmit (values) {
      console.log(values);
      this.confirmLoading = true
      Api.add({ form: values })
        .then((result) => {
          // 显示成功
          this.$message.success(result.message, 1.5)
          // 关闭对话框事件
          this.handleCancel()
          // 通知父端组件提交完成了
          this.$emit('handleSubmit', values)
        })
        .finally(() => {
          this.confirmLoading = false
        })
    }

  }
}
</script>

<template>
  <a-modal
    :title="title"
    :width="720"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="评分" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['score', {initialValue: 10, rules: [{required: true}]}]">
            <a-radio :value="10">好评</a-radio>
            <a-radio :value="20">中评</a-radio>
            <a-radio :value="30">差评</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="评价内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea
            placeholder="请输入评价内容 (300个字符以内)"
            :autoSize="{ minRows: 4 }"
            v-decorator="['content']"
          />
        </a-form-item>
        <a-form-item
          label="评价图片"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="最多允许6张，可拖拽调整显示顺序"
        >
          <SelectImage
            multiple
            :maxNum="6"
            :defaultList="record.imageList"
            v-decorator="['imageIds']"
          />
        </a-form-item>
        <a-form-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="用户端是否展示">
          <a-radio-group v-decorator="['status', {initialValue: 1, rules: [{required: true}]}]">
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="数字越小越靠前">
          <a-input-number
            :min="0"
            v-decorator="['sort', {initialValue: 100, rules: [{required: true, message: '请输入至少1个数字'}]}]"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import * as Api from '@/api/goods/comment'
import { SelectImage } from '@/components'

export default {
  components: {
    SelectImage
  },
  data () {
    return {
      // 对话框标题
      title: '编辑评价',
      // 标签布局属性
      labelCol: {
        span: 7
      },
      // 输入框布局属性
      wrapperCol: {
        span: 13
      },
      // modal(对话框)是否可见
      visible: false,
      // modal(对话框)确定按钮 loading
      confirmLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),

      // 当前记录ID
      commentId: null,
      // 当前记录详情
      record: {}
    }
  },
  methods: {

    /**
     * 显示对话框
     */
    edit (commentId) {
      // 显示窗口
      this.visible = true
      // 当前记录ID
      this.commentId = commentId
      // 获取当前详情记录
      this.getRecordData()
    },

    // 获取当前详情记录
    getRecordData () {
      this.confirmLoading = true
      Api.detail({ commentId: this.commentId })
        .then(result => {
          // 当前记录
          this.record = result.data.detail
          // 设置默认值
          this.setFieldsValue()
        })
        .finally((result) => {
          this.confirmLoading = false
        })
    },

    /**
     * 设置默认值
     */
    setFieldsValue () {
      const { form: { setFieldsValue } } = this
      this.$nextTick(() => {
        setFieldsValue(pick(this.record, ['score', 'content', 'status', 'sort', 'imageIds']))
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
     * 关闭对话框事件
     */
    handleCancel () {
      this.visible = false
      this.record = {}
      this.form.resetFields()
    },

    /**
    * 提交到后端api
    */
    onFormSubmit (values) {
      this.confirmLoading = true
      Api.edit({ commentId: this.commentId, form: values })
        .then((result) => {
           // 显示成功
          this.$message.success(result.message, 1.5)
          // 关闭对话框事件
          this.handleCancel()
          // 通知父端组件提交完成了
          this.$emit('handleSubmit', values)
        })
        .finally((result) => {
          this.confirmLoading = false
        })
    }

  }
}
</script>

<template>
  <a-modal
    :title="title"
    :width="780"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="文章标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['title', {rules: [{required: true, min: 2, message: '请输入至少2个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="文章分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            v-decorator="['category_id', {rules: [{required: true, message: '请选择1个文章分类'}]}]"
          >
            <a-select-option
              v-for="(item, index) in categoryList"
              :key="index"
              :value="item.category_id"
            >{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="列表显示方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-decorator="['show_type', {initialValue: 10, rules: [{required: true}]}]">
            <a-radio :value="10">小图模式</a-radio>
            <a-radio :value="20">大图模式</a-radio>
          </a-radio-group>
          <div class="form-item-help">
            <p class="extra">小图模式建议封面图尺寸：300 * 188</p>
            <p class="extra">大图模式建议封面图尺寸：750 * 455</p>
          </div>
        </a-form-item>
        <a-form-item label="封面图" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <SelectImage
            :defaultList="record.image ? [record.image] : []"
            v-decorator="['image_id', { rules: [{ required: true, message: '请选择1个封面图' }] }]"
          />
        </a-form-item>
        <a-form-item label="文章内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <Ueditor v-decorator="['content', { rules: [{ required: true, message: '文章内容不能为空' }] }]" />
        </a-form-item>
        <a-form-item
          label="虚拟阅读量"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="用户看到的阅读量 = 实际阅读量 + 虚拟阅读量"
        >
          <a-input-number :min="0" v-decorator="['virtual_views', {initialValue: 100}]" />
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
import * as Api from '@/api/content/article'
import { SelectImage, Ueditor } from '@/components'

export default {
  components: {
    SelectImage,
    Ueditor
  },
  props: {
    // 分类列表
    categoryList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      // 对话框标题
      title: '编辑文章',
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
      articleId: null,
      // 当前记录详情
      record: {}
    }
  },
  methods: {

    /**
     * 显示对话框
     */
    edit (articleId) {
      // 显示窗口
      this.visible = true
      // 当前记录ID
      this.articleId = articleId
      // 获取当前详情记录
      this.getDetail()
    },

    // 获取当前详情记录
    getDetail () {
      this.confirmLoading = true
      Api.detail({ articleId: this.articleId })
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
        setFieldsValue(pick(this.record, [
          'title', 'show_type', 'category_id', 'image_id', 'content', 'sort', 'status', 'virtual_views'
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
      Api.edit({ articleId: this.articleId, form: values })
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

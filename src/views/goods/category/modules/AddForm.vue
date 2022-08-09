<template>
  <a-modal
    title="新增商品分类"
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
        <a-form-item label="分类名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['name', {rules: [{required: true, min: 2, message: '请输入至少2个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="上级分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-tree-select
            :treeData="categoryListTree"
            :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
            allowClear
            v-decorator="['parent_id', {initialValue: 0}]"
          ></a-tree-select>
        </a-form-item>
        <a-form-item label="分类图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <SelectImage v-decorator="['image_id']" />
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
import * as Api from '@/api/category'
import { SelectImage } from '@/components'
import CategoryModel from '@/common/model/Category'

export default {
  components: {
    SelectImage
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
      title: '',
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

      // 上级分类列表
      categoryListTree: []
    }
  },
  methods: {

    /**
     * 显示对话框
     */
    add () {
      // 显示窗口
      this.visible = true
      // 获取分类列表
      this.getCategoryList()
    },

    /**
     * 获取分类列表
     */
    getCategoryList () {
      const { categoryList } = this
      // 格式化分类列表
      const selectList = CategoryModel.formatTreeData(categoryList)
      // 顶级分类
      this.categoryListTree = [{
        title: '顶级分类',
        key: 0,
        value: 0
      }].concat(selectList)
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
        if (!errors) {
          this.onFormSubmit(values)
        }
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
        .finally((result) => {
          this.confirmLoading = false
        })
    }

  }
}
</script>

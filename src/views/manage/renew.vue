<template>
  <a-card :bordered="false">
    <content-header title="管理员设置"></content-header>
    <a-spin :spinning="isLoading">
      <a-form :form="form">
        <a-form-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="管理员姓名">
          <a-input
            v-decorator="['real_name', {rules: [{required: true, min: 2, message: '请输入至少2个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="用户名" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="后台登录用户名">
          <a-input
            v-decorator="['user_name', {rules: [{required: true, min: 4, message: '请输入至少4个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="用户密码" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="后台登录密码">
          <a-input
            type="password"
            v-decorator="['password', {rules: [{min: 6, message: '请输入至少6个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="确认密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            type="password"
            v-decorator="['password_confirm', {rules: [
              {message: '请输入确认密码'},
              {validator: compareToFirstPassword}
            ]}]"
          />
        </a-form-item>
        <a-form-item :wrapperCol="{span: 13, offset: 6}">
          <a-button
            type="primary"
            :loading="isLoading"
            :disabled="isLoading"
            @click="handleSubmit"
          >提交</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-card>
</template>

<script>
import * as Api from '@/api/store/user'
import { ContentHeader, STable } from '@/components'
import _ from 'lodash'

export default {
  name: 'TableList',
  components: {
    ContentHeader,
    STable
  },
  data () {
    return {
      // 标签布局属性
      labelCol: {
        span: 6
      },
      // 输入框布局属性
      wrapperCol: {
        span: 13
      },
      // 正在提交
      isLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this)
    }
  },
  mounted () {
    // 获取管理员设置
    this.getInfo()
  },
  methods: {

    /**
     * 获取管理员设置
     */
    getInfo () {
      this.isLoading = true
      Api.getInfo()
        .then((result) => {
          const { data: { userInfo } } = result
          // console.log(_.pick(userInfo, 'user_name', 'real_name'));  结果--> { user_name: 'xxx', real_name: 'xxx' }
          // _.pick(object, string | string[]) 将一个对象里面的指定属性筛选出来,并过滤掉未选择的属性,返回值是筛选出来的的新对象
          this.form.setFieldsValue(_.pick(userInfo, 'user_name', 'real_name'))
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    /**
     * 验证确认密码是否一致
     */
    compareToFirstPassword (rule, value, callback) {
      const { form } = this
      const passwordVal = form.getFieldValue('password')
      if (passwordVal && (value !== passwordVal)) {
        return new Error('您输入的确认密码不一致')
      }
      return true
    },

    /**
     * 确认按钮
     */
    handleSubmit (e) {
      e.preventDefault()
      const { form: { validateFields } } = this
      // 表单的验证
      validateFields((errors, values) => {
        if (!errors) {
          this.isLoading = true
          // 提交到后端api
          this.onFormSubmit(values)
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },

    /**
    * 提交到后端api
    */
    onFormSubmit (values) {
      console.log(values);
      return Api.renew({ form: values })
        .then(result => {
          // 显示成功
          this.$message.success(result.message)
          setTimeout(() => {
            window.location.reload()
          }, 800)
        })
    }

  }
}
</script>

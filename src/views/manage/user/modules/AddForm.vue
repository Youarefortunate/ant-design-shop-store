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
        <a-form-item label="管理员姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['real_name', {rules: [{required: true, min: 2, message: '请输入至少2个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="用户名" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="后台登录用户名">
          <a-input
            v-decorator="['user_name', {rules: [{required: true, min: 4, message: '请输入至少4个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="所属角色" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="后台管理员角色">
          <a-tree-select
            treeCheckable
            treeCheckStrictly
            treeDefaultExpandAll
            allowClear
            :treeData="roleListTreeData"
            :dropdownStyle="{ maxHeight: '500px', overflow: 'auto' }"
            v-decorator="['roles', {rules: [{required: true, message: '请至少选择一个角色'}]}]"
          ></a-tree-select>
        </a-form-item>
        <a-form-item label="用户密码" :labelCol="labelCol" :wrapperCol="wrapperCol" extra="后台登录密码">
          <a-input
            type="password"
            v-decorator="['password', {rules: [
              {required: true, min: 6, message: '请输入至少6个字符'}
            ]}]"
          />
        </a-form-item>
        <a-form-item label="确认密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            type="password"
            v-decorator="['password_confirm', {rules: [
              {required: true, message: '请输入确认密码'},
              {validator: compareToFirstPassword}
            ]}]"
          />
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

import * as Api from '@/api/store/user'

export default {
  props: {
    // 角色列表
    roleList: {
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

      // 角色列表 树状结构
      roleListTreeData: []
    }
  },
  methods: {

    /**
     * 显示对话框
     */
    add () {
      this.title = '新增管理员'
      this.visible = true
      // 获取角色列表
      this.getRoleList()
    },

    /**
     * 获取角色列表
     */
    getRoleList () {
      const { roleList } = this
      // 格式化角色列表
      const selectList = this.formatTreeData(roleList)
      this.roleListTreeData = selectList
    },

    /**
     * 设置默认选中的角色
     */
    getCheckedRoleKeys () {
      const { roleList, record } = this
      const getCheckedKeys = (list) => {
        let keysArr = []
        list.forEach(item => {
          if (record['roleIds'].includes(item['role_id'])) {
            keysArr.push({
              label: item['role_name'],
              value: item['role_id']
            })
          }
          if (item.children && item.children.length) {
            const childrenArr = getCheckedKeys(item.children)
            childrenArr.length && (keysArr = keysArr.concat(childrenArr))
          }
        })
        return keysArr
      }
      return getCheckedKeys(roleList)
    },

    /**
     * 格式化角色列表
     */
    formatTreeData (list) {
      const data = []
      list.forEach(item => {
        const netItem = {
          title: item.role_name, // role_name角色名称,如运营人员等
          key: item.role_id, // 角色id,如运营人员的角色id为:10001
          value: item.role_id
        }
        if (item.children && item.children.length) {
          netItem['children'] = this.formatTreeData(item['children'])
        }
        data.push(netItem)
      })
      return data
    },

    /**
     * 确认按钮
     */
    handleSubmit (e) {
      e.preventDefault()
      const { form: { validateFields } } = this
      // 表单验证
      validateFields((errors, values) => {
        // 整理角色id
        if (values.roles) {
          values.roles = values.roles.map(item => item.value)
        }
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
     * 验证确认密码是否一致
     */
    compareToFirstPassword (rule, value, callback) {
      const { form } = this
      if (value && value !== form.getFieldValue('password')) {
        return new Error('您输入的确认密码不一致')
      }
      return true
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
          // 关闭对话框
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

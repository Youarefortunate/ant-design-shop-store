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
        <a-form-item
          v-if="!record.is_super"
          label="所属角色"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="后台管理员角色"
        >
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
            v-decorator="['password', {rules: [{min: 6, message: '请输入至少6个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="确认密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            type="password"
            v-decorator="['password_confirm', {rules: [
              { message: '请输入确认密码'},
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
import _ from 'lodash'
import * as UserApi from '@/api/store/user'

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
      roleListTreeData: [],
      // 当前记录
      record: {}
    }
  },
  methods: {

    /**
     * 显示对话框
     * @param {*}record 点击的table那一行的所有数据
     */
    edit (record) {
      // 显示窗口
      this.title = '编辑管理员'
      this.visible = true
      // 当前管理员记录
      this.record = record
      // 获取角色列表
      !record['is_super'] && this.getRoleList()
      // 设置默认值
      this.setFieldsValue()
    },

    /**
     * 设置默认值
     */
    setFieldsValue () {
      const { form: { setFieldsValue }, getCheckedRoleKeys } = this
      this.$nextTick(() => {
        // let newObject = _.pick(object, [props])函数: 创建一个从第一个参数中选中的属性的对象
        // 第二个参数数组中的值为第一个参数中对象的属性值,选中的属性值为挑选出来的值，存放到返回值对象中
        const data = _.pick(this.record, ['user_name', 'real_name', 'sort'])
        data.roles = getCheckedRoleKeys()
        setFieldsValue(data)
      })
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
          title: item.role_name,
          key: item.role_id,
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
      // 表单验证
      const { form: { validateFields } } = this
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
      this.confirmLoading = true
      UserApi.edit({ userId: this.record['store_user_id'], form: values })
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

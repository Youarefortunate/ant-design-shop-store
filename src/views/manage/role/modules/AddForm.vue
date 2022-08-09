<template>
  <a-modal
    title="新增角色"
    :width="720"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="角色名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input
            v-decorator="['role_name', {rules: [{required: true, min: 2, message: '请输入至少2个字符'}]}]"
          />
        </a-form-item>
        <a-form-item label="上级角色" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-tree-select
            :treeData="roleListTree"
            :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
            allowClear
            v-decorator="['parent_id']"
          ></a-tree-select>
        </a-form-item>

        <a-form-item
          label="菜单权限"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          extra="设置该角色有权操作的功能"
        >
          <a-tree
            ref="MenuTree"
            v-model="checkedKeys"
            checkable
            checkStrictly
            :treeData="menuListTreeData"
            :autoExpandParent="false"
            @check="onCheckedMenu"
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
import * as Api from '@/api/store/role'
import _ from 'lodash'

export default {
  props: {
    // 角色列表
    roleList: {
      type: Array,
      required: true
    },
    // 菜单列表
    menuList: {
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
      // 上级角色列表
      roleListTree: [],
      // 菜单列表 树状结构
      menuListTreeData: [],
      // 当前选中的keys
      checkedKeys: {
        checked: [],
        halfChecked: []
      }
    }
  },
  methods: {
    /**
     * 显示对话框
     */
    add () {
      // 显示窗口
      this.visible = true
      // 获取角色列表
      this.getRoleList()
      // 获取API权限列表
      this.getMenuList()
    },

    /**
     * 获取菜单列表
     */
    getMenuList () {
      const { menuList } = this
      this.menuListTreeData = this.formatTreeDataForMenuList(menuList)
    },

    // 节点选中事件
    onCheckedMenu (checkedKeys, { checked, node }) {
      // 寻找当前选择的节点
      const { menuListTreeData } = this
      const nodeData = this.findNode(node.eventKey, menuListTreeData)
      // 选择节点时联动所有子节点
      this.onCheckChilds(checked, nodeData)
      // 选择节点时联动所有父节点
      this.onCheckParents(checked, nodeData)
    },

    // 寻找指定的的节点
    findNode (key, list) {
      for (let index = 0; index < list.length; index++) {
        const item = list[index]
        if (item.key === key) {
          return item
        } else if (item.children) {
          const result = this.findNode(key, item.children)
          if (result) {
            return result
          }
        }
      }
      return false
    },

    // 选择节点时联动所有父节点
    onCheckParents (checked, node) {
      // 查找所有父节点(方法)
      const { menuListTreeData } = this
      const findParentKeys = (parentKey) => {
        let keys = []
        const parent = this.findNode(parentKey, menuListTreeData)
        if (!parent) {
          return keys
        }
        keys.push(parent.key)
        if (parent.children) {
          const arr = findParentKeys(parent.parentKey)
          arr.length && (keys = keys.concat(arr))
        }
        return keys
      }
      // 查找所有父节点
      const parentKeys = findParentKeys(node.parentKey)
      // 设置为选中
      if (checked && parentKeys.length) {
        this.checkedKeys.checked = _.union(this.checkedKeys.checked, parentKeys)
      }
    },

    // 选择节点时联动所有子节点
    onCheckChilds (checked, node) {
      // 获取当前节点的所有子级ID
      const childKeys = node.children ? this.getAllMenuKeys(node.children) : []
      if (childKeys.length) {
        this.checkedKeys.checked = checked ? _.union(this.checkedKeys.checked, childKeys) : _.difference(this.checkedKeys.checked, childKeys)
      }
    },

    // 获取菜单列表中所有子级的id
    getAllMenuKeys (list) {
      let keysArr = []
      list.forEach(item => {
        keysArr.push(item.key)
        if (item.children && item.children.length) {
          const childrenArr = this.getAllMenuKeys(item.children)
          childrenArr.length && (keysArr = keysArr.concat(childrenArr))
        }
      })
      return keysArr
    },

    /**
     * 获取角色列表
     */
    getRoleList () {
      const { roleList } = this
      // 格式化角色列表
      const selectList = this.formatTreeForRoleList(roleList)
      // 顶级角色
      selectList.unshift({
        title: '顶级角色',
        key: 0,
        value: 0
      })
      this.roleListTree = selectList
    },

    /**
     * 格式化角色列表
     */
    formatTreeForRoleList (list) {
      const data = []
      list.forEach(item => {
        // 新的元素
        const netItem = {
          title: item.role_name,
          key: item.role_id,
          value: item.role_id
        }
        // 递归整理子集
        if (item.children && item.children.length) {
          netItem['children'] = this.formatTreeForRoleList(item['children'])
        }
        data.push(netItem)
      })
      return data
    },

    // 格式化菜单列表
    formatTreeDataForMenuList (list) {
      const data = []
      list.forEach(item => {
        // 新的元素
        const netItem = {
          title: item.name,
          key: item.menu_id,
          parentKey: item.parent_id
        }
        // 递归整理子集
        if (item.children && item.children.length) {
          netItem['children'] = this.formatTreeDataForMenuList(item['children'])
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
        // 提交到后端api
        if (!errors) {
          this.onFormSubmit({ ...values, menus: this.getCheckedKeys() })
        }
      })
    },

    /**
     * 获取所有选中的节点(菜单)
     */
    getCheckedKeys () {
      const { $refs: { MenuTree } } = this
      return [
        ...MenuTree.getCheckedKeys(),
        ...MenuTree.getHalfCheckedKeys()
      ]
    },

    /**
     * 关闭对话框事件
     */
    handleCancel () {
      this.visible = false
      this.form.resetFields()
      const { $refs: { MenuTree } } = this
      MenuTree.clearExpandedKeys()
      this.checkedKeys.checked = []
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

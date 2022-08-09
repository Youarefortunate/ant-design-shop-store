export const PERMISSION_ENUM = {
  'add': { key: 'add', label: '新增' },
  'delete': { key: 'delete', label: '删除' },
  'edit': { key: 'edit', label: '修改' },
  'query': { key: 'query', label: '查询' },
  'get': { key: 'get', label: '详情' },
  'enable': { key: 'enable', label: '启用' },
  'disable': { key: 'disable', label: '禁用' },
  'import': { key: 'import', label: '导入' },
  'export': { key: 'export', label: '导出' }
}

function plugin (Vue) {
  if (plugin.installed) {
    return
  }

  !Vue.prototype.$auth && Object.defineProperties(Vue.prototype, {
    $auth: {
      get () {
        const _this = this
        return (permissions) => {
          const [permission, action] = permissions.split('.')
          const roles = _this.$store.getters.roles
          // 如果是超管用户直接返回true
          if (roles.isSuper) {
            return true
          }
          // console.log('permissionList', roles.permissions)
          // 查找指定的权限
          const findPermission = roles.permissions.find((val) => {
            return val.permissionId === permission
          })
          if (!findPermission) {
            // console.error(`未找到权限: ${permission}`)
            return false
          }
          // 未输入动作
          if (action === undefined) {
            return true
          }
          return findPermission.actionList.findIndex((val) => {
            return val === action
          }) > -1

        }
      }
    }
  })

  !Vue.prototype.$enum && Object.defineProperties(Vue.prototype, {
    $enum: {
      get () {
        // const _this = this;
        return (val) => {
          let result = PERMISSION_ENUM
          val && val.split('.').forEach(v => {
            result = result && result[v] || null
          })
          return result
        }
      }
    }
  })
}

export default plugin

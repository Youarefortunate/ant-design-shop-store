import PropTypes from 'ant-design-vue/es/_util/vue-types'
import { Menu, Icon } from 'ant-design-vue'
import './index.less'

const {
  Item: MenuItem,
  SubMenu
} = Menu

export const RouteMenuProps = {
  menus: PropTypes.array,
  collapsed: PropTypes.bool.def(false),
  theme: PropTypes.string.def('dark'),
  mode: PropTypes.string.def('inline'),
  i18nRender: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]).def(false)
}

const renderMenu = (h, item, i18nRender) => {
  if (item && !item.hidden) {
    // 是否渲染子菜单
    // 这里屏蔽hideChildrenInMenu属性
    item.hideChildrenInMenu = true
    const bool = item.children && !item.hideChildrenInMenu
    return bool ? renderSubMenu(h, item, i18nRender) : renderMenuItem(h, item, i18nRender)
  }
  return null
}

const renderSubMenu = (h, item, i18nRender) => {
  return (
    <SubMenu key={item.path} title={(
      <span>
        {renderIcon(h, item.meta.icon)}
        <span>{renderTitle(h, item.meta.title, i18nRender)}</span>
      </span>
    )}>
      {!item.hideChildrenInMenu && item.children.map(cd => renderMenu(h, cd, i18nRender))}
    </SubMenu>
  )
}

const renderMenuItem = (h, item, i18nRender) => {
  const meta = Object.assign({}, item.meta)
  const target = meta.target || null
  // const CustomTag = target && 'a' || 'router-link'
  const CustomTag = 'router-link'
  const props = { to: { path: item.path } }
  const attrs = { target }

  // 这里屏蔽hideChildrenInMenu属性
  item.hideChildrenInMenu = true
  if (item.children && item.hideChildrenInMenu) {
    // 把有子菜单的 并且 父菜单是要隐藏子菜单的
    // 都给子菜单增加一个 hidden 属性
    // 用来给刷新页面时， selectedKeys 做控制用
    item.children.forEach(cd => {
      cd.meta = Object.assign(cd.meta, { hidden: true })
    })
  }

  return (
    <MenuItem key={item.path}>
      <CustomTag {...{ props, attrs }}>
        {renderIcon(h, meta.icon, meta.iconStyle)}
        {renderTitle(h, meta.title, i18nRender)}
      </CustomTag>
    </MenuItem>
  )
}

const renderIcon = (h, icon, iconStyle) => {
  if (icon === undefined || icon === 'none' || icon === null) {
    return null
  }
  const props = {}
  typeof (icon) === 'object' ? (props.component = icon) : (props.type = icon)
  return <Icon style={iconStyle} {...{ props }} />
}

const renderTitle = (h, title, i18nRender) => {
  return <span>{i18nRender && i18nRender(title) || title}</span>
}

const RouteMenu = {
  name: 'RouteMenu',
  props: RouteMenuProps,
  data () {
    return {
      openKeys: [],
      selectedKeys: [],
      cachedOpenKeys: []
    }
  },
  render (h) {
    const { mode, theme, menus, i18nRender } = this
    const handleOpenChange = (openKeys) => {
      // 在水平模式下时，不再执行后续
      if (mode === 'horizontal') {
        this.openKeys = openKeys
        return
      }
      const latestOpenKey = openKeys.find(key => !this.openKeys.includes(key))
      if (!this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    }

    const dynamicProps = {
      props: {
        mode,
        theme,
        openKeys: this.openKeys,
        selectedKeys: this.selectedKeys
      },
      on: {
        select: menu => {
          this.selectedKeys = menu.selectedKeys
          this.$emit('select', menu)
        },
        openChange: handleOpenChange
      }
    }

    const menuItems = menus.map(item => {
      if (item.hidden) {
        return null
      }
      return renderMenu(h, item, i18nRender)
    })
    return <Menu class="sub-menu" {...dynamicProps}>{menuItems}</Menu>
  },
  methods: {
    // 更新菜单
    updateMenu () {
      const routes = this.$route.matched.concat()
      // const { hidden } = this.$route.meta
      // if (routes.length >= 3 && hidden) {
      //   routes.pop()
      //   this.selectedKeys = [routes[routes.length - 1].path]
      // } else {
      //   this.selectedKeys = [routes.pop().path]
      // }

      // 此处兼容子级菜单
      this.selectedKeys = [this.$route.matched[1].path]
      const openKeys = []
      if (this.mode === 'inline') {
        routes.forEach(item => {
          item.path && openKeys.push(item.path)
        })
      }
      this.collapsed ? (this.cachedOpenKeys = openKeys) : (this.openKeys = openKeys)
    }
  },
  computed: {
    rootSubmenuKeys: vm => {
      const keys = []
      vm.menus.forEach(item => keys.push(item.path))
      return keys
    }
  },
  created () {
    // 监听路由有变化时 更新菜单
    this.$watch('$route', () => {
      this.updateMenu()
    })
    // 监听菜单收缩事件
    this.$watch('collapsed', val => {
      if (val) {
        this.cachedOpenKeys = this.openKeys.concat()
        this.openKeys = []
      } else {
        this.openKeys = this.cachedOpenKeys
      }
    })
  },
  mounted () {
    this.updateMenu()
  }
}

export default RouteMenu

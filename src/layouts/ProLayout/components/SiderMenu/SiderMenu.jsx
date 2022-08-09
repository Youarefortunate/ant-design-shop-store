import './index.less'

import PropTypes from 'ant-design-vue/es/_util/vue-types'
import { Layout } from 'ant-design-vue'
// 一级菜单
import BaseMenu from '../RouteMenu'
// 子菜单
import SecondMenu from '../SecondMenu'

// 侧边栏组件
const { Sider } = Layout

export const SiderMenuProps = {
  i18nRender: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]).def(false),
  mode: PropTypes.string.def('inline'),
  theme: PropTypes.string.def('dark'),
  contentWidth: PropTypes.bool,
  collapsible: PropTypes.bool,
  handleCollapse: PropTypes.func,
  // 菜单数据
  menus: PropTypes.array,
  // 子菜单数据
  subMenus: PropTypes.array,
  // 子菜单标题
  subMenuTitle: PropTypes.string.def(''),
  // 是否缩起
  collapsed: PropTypes.bool,
  // 是否存在子菜单
  hasSubMenu: PropTypes.bool.def(false),
  // sider容器的宽度
  // 当存在二级菜单时宽度为280，不存在则160
  siderWidth: PropTypes.number.def(160),
  // 子菜单容器宽度 120
  subMenuWidth: PropTypes.number.def(120),
  isMobile: PropTypes.bool,
  layout: PropTypes.string.def('inline'),
  fixSiderbar: PropTypes.bool,
  logo: PropTypes.any,
  title: PropTypes.string.def(''),
  menuHeaderRender: PropTypes.func
}

// logo信息
export const defaultRenderLogo = (h, logo) => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />
  }
  if (typeof logo === 'function') {
    return logo()
  }
  return h(logo)
}

// 顶部信息
export const defaultRenderLogoAntTitle = (h, props) => {
  const {
    logo = 'https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg',
    title,
    menuHeaderRender
  } = props

  if (menuHeaderRender === false) {
    return null
  }
  const logoDom = defaultRenderLogo(h, logo)
  const titleDom = <h1>{title}</h1>

  if (menuHeaderRender) {
    return menuHeaderRender(h, logoDom, props.collapsed ? null : titleDom, props)
  }
  return (
    <span>
      {/* 此处屏蔽logo */}
      {/* {logoDom} */}
      {titleDom}
    </span>
  )
}

const SiderMenu = {
  name: 'SiderMenu',
  model: {
    prop: 'collapsed',
    event: 'collapse'
  },
  props: SiderMenuProps,
  created () {
  },
  render (h) {
    const {
      collapsible,
      collapsed,
      siderWidth,
      fixSiderbar,
      mode,
      theme,
      menus,
      logo,
      title,
      handleCollapse,
      onMenuHeaderClick = () => null,
      i18nRender,
      menuHeaderRender
    } = this
    const siderCls = ['ant-pro-sider-menu-sider']
    if (fixSiderbar) siderCls.push('fix-sider-bar')
    if (theme === 'light') siderCls.push('light')

    // const handleCollapse = (collapsed, type) => {
    //   this.$emit('collapse', collapsed)
    // }

    const headerDom = defaultRenderLogoAntTitle(h, {
      logo, title, menuHeaderRender, collapsed
    })

    return (
      <Sider
        class={siderCls}
        breakpoint={'lg'}
        trigger={null}
        width={siderWidth}
        theme={theme}
        collapsible={collapsible}
        collapsed={collapsed}
        onCollapse={handleCollapse}
      >
        {/* 一级菜单 */}
        <div class="sidebar-menu-first">
          {/* 顶部信息 */}
          {headerDom && (
            <div
              class="ant-pro-sider-menu-logo"
              onClick={onMenuHeaderClick}
              id="logo"
            >
              <router-link to={{ path: '/' }}>
                {headerDom}
              </router-link>
            </div>
          )}
          {/* 菜单内容 */}
          <BaseMenu collapsed={collapsed} menus={menus} mode={mode} theme={theme} i18nRender={i18nRender} />
        </div>

        {/* 子菜单 */}
        {this.renderSecondMenu()}
      </Sider>
    )
  },
  methods: {

    // 渲染子菜单
    renderSecondMenu () {
      const { hasSubMenu, subMenus, subMenuWidth, subMenuTitle, collapsed } = this
      return !hasSubMenu ? null : (
        <div class="sidebar-menu-second" style={{ width: `${subMenuWidth}px` }}>
          <SecondMenu collapsed={collapsed} subMenuTitle={subMenuTitle} subMenus={subMenus} />
        </div>
      )
    }
  }
}

export default SiderMenu

import './index.less'

import debounce from 'lodash/debounce'
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import { triggerEvent, inBrowser, isFun } from '../../utils/util'
import { Icon } from 'ant-design-vue'
import { defaultRenderLogo } from '../SiderMenu/SiderMenu'

export const GlobalHeaderProps = {
  collapsed: PropTypes.bool,
  handleCollapse: PropTypes.func,
  isMobile: PropTypes.bool.def(false),
  fixedHeader: PropTypes.bool.def(false),
  logo: PropTypes.any,
  menuRender: PropTypes.any,
  collapsedButtonRender: PropTypes.any,
  rightContentRender: PropTypes.any
}

const headerCls = 'ant-pro-global-header'

const GlobalHeader = {
  name: 'GlobalHeader',
  props: GlobalHeaderProps,
  inject: ['locale'],
  render (h) {
    const { isMobile, logo, rightContentRender } = this.$props
    // const onCollapsed = () => {
    //   const { collapsed, handleCollapse } = this.$props
    //   if (handleCollapse) handleCollapse(!collapsed)
    //   this.triggerResizeEvent()
    // }

    return (
      <div class={headerCls}>
        {isMobile && (
          <a class={`${headerCls}-logo`} key="logo" href={'/'}>
            {defaultRenderLogo(h, logo)}
          </a>
        )}
        <div class={headerCls + '-tools'}>
          {this.renderCollapsedButton()}
          {this.renderRefreshButton()}
          {this.renderBreadcrumb()}
          {isFun(rightContentRender) && rightContentRender(h, this.$props) || rightContentRender}
        </div>
      </div>
    )
  },
  methods: {

    triggerResizeEvent: debounce(() => {
      inBrowser && triggerEvent(window, 'resize')
    }),

    // 收缩菜单按钮
    renderCollapsedButton () {
      const {
        collapsed,
        collapsedButtonRender = (collapsed) => <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />,
        menuRender
      } = this.$props
      if (collapsedButtonRender !== false && menuRender !== false) {
        return (
          <div class={`${headerCls}-trigger`} onClick={this.onCollapsed}>
            {isFun(collapsedButtonRender) && collapsedButtonRender(collapsed) || collapsedButtonRender}
          </div>
        )
      }
      return null
    },

    // 刷新按钮
    renderRefreshButton () {
      return (
        <span class="ant-pro-global-header-trigger" onClick={this.onRefresh}>
          <Icon type="reload" />
        </span>
      )
    },

    // 面包屑
    renderBreadcrumb () {
      const { locale, $route } = this
      // 整理路由列表
      const routes = []
      $route.matched.concat().forEach(route => {
        (route.meta && route.meta.title) && routes.push({
          path: route.path,
          breadcrumbName: locale(route.meta.title)
        })
      })
      if (routes.length <= 1) {
        return null
      }
      // 渲染link
      const renderItem = (route, isActive = false) => {
        const itemClass = ['ant-breadcrumb-link']
        isActive && itemClass.push('active')
        return <span class={itemClass}>{route.breadcrumbName}</span>
      }
      // item
      const renderList = []
      const Separator = <span class="ant-breadcrumb-separator">/</span>
      routes.forEach(route => {
        const isActive = routes.indexOf(route) === routes.length - 1
        renderList.push(renderItem(route, isActive))
        !isActive && renderList.push(Separator)
      })
      return (
        <div class={`${headerCls}-breadcrumb`}>
          {renderList}
        </div>
      )
    },

    /**
     * 收缩菜单事件
     */
    onCollapsed () {
      const { collapsed, handleCollapse } = this.$props
      if (handleCollapse) handleCollapse(!collapsed)
      this.triggerResizeEvent()
    },

    /**
     * 刷新页面事件
     */
    onRefresh () {
      window.location.reload()
    }

  },

  beforeDestroy () {
    this.triggerResizeEvent.cancel && this.triggerResizeEvent.cancel()
  }
}

export default GlobalHeader

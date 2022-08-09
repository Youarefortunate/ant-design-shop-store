import './BasicLayout.less'

import PropTypes from 'ant-design-vue/es/_util/vue-types'

import { Layout } from 'ant-design-vue'
import { ContainerQuery } from 'vue-container-query'
import { SiderMenuWrapper, GlobalFooter } from './components'
import { getComponentFromProp, isFun } from './utils/util'
import { SiderMenuProps } from './components/SiderMenu'
import HeaderView, { HeaderViewProps } from './Header'
import WrapContent from './WrapContent'
import ConfigProvider from './components/ConfigProvider'

export const BasicLayoutProps = {
  ...SiderMenuProps,
  ...HeaderViewProps,
  locale: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).def('en-US'),
  breadcrumbRender: PropTypes.func,
  disableMobile: PropTypes.bool.def(false),
  mediaQuery: PropTypes.object.def({}),
  handleMediaQuery: PropTypes.func,
  footerRender: PropTypes.func
}

const MediaQueryEnum = {
  'screen-xs': {
    maxWidth: 575
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599
  },
  'screen-xxl': {
    minWidth: 1600
  }
}

const getPaddingLeft = (hasLeftPadding, collapsed = undefined, siderWidth) => {
  if (hasLeftPadding) {
    return collapsed ? 80 : siderWidth
  }
  return 0
}

const headerRender = (h, props) => {
  if (props.headerRender === false) {
    return null
  }
  return <HeaderView {...{ props }} />
}

const defaultI18nRender = (key) => key

const BasicLayout = {
  name: 'BasicLayout',
  functional: true,
  props: BasicLayoutProps,
  render (h, content) {
    const { props, children } = content
    const {
      layout,
      // theme,
      isMobile,
      collapsed,
      siderWidth,
      mediaQuery,
      handleMediaQuery,
      handleCollapse,
      contentWidth,
      fixSiderbar,
      i18nRender = defaultI18nRender
    } = props

    const footerRender = getComponentFromProp(content, 'footerRender')
    const rightContentRender = getComponentFromProp(content, 'rightContentRender')
    const collapsedButtonRender = getComponentFromProp(content, 'collapsedButtonRender')
    const menuHeaderRender = getComponentFromProp(content, 'menuHeaderRender')
    const breadcrumbRender = getComponentFromProp(content, 'breadcrumbRender')

    const isTopMenu = layout === 'topmenu'
    const hasSiderMenu = !isTopMenu
    // If it is a fix menu, calculate padding
    // don't need padding in phone mode
    const hasLeftPadding = fixSiderbar && !isTopMenu && !isMobile
    const cdProps = {
      ...props,
      siderWidth,
      hasSiderMenu,
      footerRender,
      menuHeaderRender,
      rightContentRender,
      collapsedButtonRender,
      breadcrumbRender
    }

    return (
      <ConfigProvider i18nRender={i18nRender} contentWidth={contentWidth} breadcrumbRender={breadcrumbRender}>
        <ContainerQuery query={MediaQueryEnum} onChange={handleMediaQuery}>
          <Layout class={{
            'ant-pro-basicLayout': true,
            'ant-pro-topmenu': isTopMenu,
            ...mediaQuery
          }}>
            {/* 顶部导航栏 */}
            {headerRender(h, {
              ...cdProps,
              mode: 'horizontal'
            })}
            {/* 左侧菜单栏 */}
            <SiderMenuWrapper
              {...{ props: cdProps }}
              collapsed={collapsed}
              onCollapse={handleCollapse}
            />
            {/* 右侧容器 */}
            <Layout class={[layout]} style={{
              paddingLeft: hasSiderMenu
                ? `${getPaddingLeft(!!hasLeftPadding, collapsed, siderWidth)}px`
                : undefined,
              minHeight: '100vh'
            }}>
              {/* 内容区 */}
              <WrapContent class="ant-pro-basicLayout-content" contentWidth={contentWidth}>
                {children}
              </WrapContent>
              {/* 底部栏 */}
              <Layout.Footer>
                {footerRender && (
                  isFun(footerRender) && footerRender(h) || footerRender
                )}
              </Layout.Footer>
            </Layout>
          </Layout>
        </ContainerQuery>
      </ConfigProvider>
    )
  }
}

export default BasicLayout

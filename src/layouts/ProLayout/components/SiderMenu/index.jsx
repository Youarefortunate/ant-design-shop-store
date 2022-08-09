import './index.less'

import { Drawer } from 'ant-design-vue'
import SiderMenu, { SiderMenuProps } from './SiderMenu'

const SiderMenuWrapper = {
  name: 'SiderMenuWrapper',
  model: {
    prop: 'collapsed',
    event: 'collapse'
  },
  props: SiderMenuProps,
  render (h) {
    const {
      layout,
      isMobile,
      collapsed
    } = this
    const isTopMenu = layout === 'topmenu'
    const handleCollapse = (e) => {
      this.$emit('collapse', true)
    }
    return isMobile ? (
      // 抽屉组件
      // https://www.antdv.com/components/drawer-cn/
      <Drawer
        class="ant-pro-sider-menu"
        visible={!collapsed}
        placement="left"
        width="300"
        maskClosable
        getContainer={null}
        onClose={handleCollapse}
        bodyStyle={{
          padding: 0,
          height: '100vh'
        }}
      >
        <SiderMenu {...{ props: { ...this.$props, collapsed: isMobile ? false : collapsed } }} />
      </Drawer>
    ) : !isTopMenu && (
      <SiderMenu class="ant-pro-sider-menu" {...{ props: this.$props }} />
    )
  }
}

SiderMenuWrapper.install = function (Vue) {
  Vue.component(SiderMenuWrapper.name, SiderMenuWrapper)
}

export {
  SiderMenu,
  SiderMenuProps
}

export default SiderMenuWrapper

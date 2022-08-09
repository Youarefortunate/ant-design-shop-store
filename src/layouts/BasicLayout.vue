<template>
  <pro-layout
    :title="storeInfo.store_name"
    :menus="menus"
    :hasSubMenu="hasSubMenu"
    :subMenus="subMenus"
    :subMenuTitle="subMenuTitle"
    :siderWidth="siderWidth"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :logo="logoRender"
    :i18nRender="i18nRender"
    v-bind="settings"
  >
    <!-- 主题设置工具 -->
    <!-- <setting-drawer :settings="settings" @change="handleSettingChange" /> -->
    <template v-slot:rightContentRender>
      <right-content
        :top-menu="settings.layout === 'topmenu'"
        :is-mobile="isMobile"
        :theme="settings.theme"
      />
    </template>
    <template v-slot:footerRender>
      <global-footer />
    </template>
    <router-view />
  </pro-layout>
</template>

<script>
import * as Api from '@/api/store'
import { SettingDrawer, SiderMenuWrapper, updateTheme } from '@/layouts/ProLayout'

import { i18nRender } from '@/locales'
import { mapState } from 'vuex'
import { SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'

import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import LogoSvg from '../assets/logo.svg?inline'

export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    SiderMenuWrapper,
    RightContent,
    GlobalFooter
  },
  data () {
    return {
      // 菜单数据
      menus: [],
      // 是否存在子菜单
      hasSubMenu: [],
      // 当前子菜单数据
      subMenus: [],
      // 侧栏收起状态
      collapsed: false,
      // 侧栏宽度
      siderWidth: 160,
      // 商城基础信息
      storeInfo: {},
      // 布局设置
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // 定宽: true / 流式: false
        contentWidth: defaultSettings.layout === 'sidemenu' ? false : defaultSettings.contentWidth === 'Fixed',
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,

        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.permission.addRouters
    })
  },
  created () {
    // 获取商城基本信息
    this.getStoreInfo()
    // 菜单数据
    const routes = this.mainMenu.find(item => item.path === '/')
    this.menus = (routes && routes.children) || []
    // 更新侧栏状态
    this.updateSider()
    this.$watch('$route', () => {
      this.updateSider()
    })
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }
    // first update color
    updateTheme(this.settings.primaryColor)
  },
  methods: {
    i18nRender,

    // 获取商城基本信息
    getStoreInfo () {
      Api.info().then((result) => {
        const { data: { storeInfo } } = result
        this.storeInfo = storeInfo
      })
    },

    // 更新侧栏状态
    updateSider () {
      // 当前group名称
      const rootName = this.$route.matched[1].name
      // 当前一级路由`
      const rootRoute = this.menus.find(item => item.name === rootName)
      // 子菜单数据
      this.subMenus = (rootRoute && rootRoute.children) || []
      // 是否存在子菜单
      this.hasSubMenu = (this.subMenus.length > 0)
      // 左侧栏宽度
      this.siderWidth = this.subMenus.length > 0 ? 280 : 160
      // 菜单名称
      this.subMenuTitle = rootRoute && rootRoute.meta.title
    },
    handleMediaQuery (val) {
      this.isMobile = false
      // this.query = val
      // if (this.isMobile && !val['screen-xs']) {
      //   this.isMobile = false
      //   return
      // }
      // if (!this.isMobile && val['screen-xs']) {
      //   this.isMobile = true
      //   this.collapsed = false
      //   this.settings.contentWidth = false
      // }
    },
    handleCollapse (val) {
      this.collapsed = val
    },
    handleSettingChange ({ type, value }) {
      console.log('type', type, value)
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value === 'Fixed'
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = false
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = true
          }
          break
      }
    },
    logoRender () {
      return <LogoSvg />
    }
  }
}
</script>

<style lang="less">
@import './BasicLayout.less';
</style>

import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'
import { isEmpty } from '@/utils/util'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// 登录页
const loginRoutePath = '/passport/login'
// 白名单
const whiteList = [loginRoutePath] // no redirect whitelist
// 默认路由地址
const defaultRoutePath = '/'

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)}`))

  // 超管后台自动登录
  const { query } = to
  if (to.path === loginRoutePath && query['superLogin']) {
    store.dispatch('SuperLogin', {
      userId: query['userId'],
      token: query['token']
    })
  }

  // 验证是否有token
  if (storage.get(ACCESS_TOKEN)) {
    // 已登录情况下访问登录页 - 跳转到默认页
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // 检查登录用户角色是否为空
      if (isEmpty(store.getters.roles)) {
        // 获取当前登录的用户信息
        store
          .dispatch('GetInfo')
          .then(data => {
            const roles = data.roles
            // 根据roles权限生成可访问的路由表
            store.dispatch('GenerateRoutes', { roles })
              .then(routers => {
                // 动态添加可访问路由表
                router.addRoutes(routers)
                // 请求带有 redirect 重定向时，登录自动重定向到该地址
                const redirect = decodeURIComponent(from.query.redirect || to.path)
                if (to.path === redirect) {
                  // 设置replace: true，这样导航将不会留下历史记录
                  next({ ...to, replace: true })
                } else {
                  // 跳转到目的路由
                  next({ path: redirect })
                }
              })
          })
          .catch(() => {
            notification.error({
              message: '错误',
              description: '请求用户信息失败，请重试'
            })
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch('Logout').then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

import storage from 'store'
import { login, logout } from '@/api/login'
import { getInfo } from '@/api/store/user'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    // avatar: '',
    roles: {},
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {

    // 用户登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then(response => {
            const data = response.data
            // token保存7天
            storage.set(ACCESS_TOKEN, data.token, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', data.token)
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const data = response.data
          const roles = data.roles
          // 遍历整理 actionList
          roles.permissions.map(item => {
            item.actionList = []
            if (item.actionEntitySet && item.actionEntitySet.length > 0) {
              item.actionList = item.actionEntitySet.map(action => action.action)
            }
          })
          roles.permissionList = roles.permissions.map(item => item.permissionId)
          commit('SET_ROLES', roles)
          commit('SET_INFO', data.userInfo)
          commit('SET_NAME', { name: data.userInfo.real_name, welcome: welcome() })
          // commit('SET_AVATAR', result.avatar)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出登录
    Logout ({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            // 清理用户信息
            commit('SET_TOKEN', '')
            commit('SET_ROLES', [])
            storage.remove(ACCESS_TOKEN)
            resolve()
          })
      })
    },

    // 超管后台自动登录
    SuperLogin ({ commit }, loginInfo) {
      // token保存7天
      storage.set(ACCESS_TOKEN, loginInfo['token'], 7 * 24 * 60 * 60 * 1000)
      commit('SET_TOKEN', loginInfo['token'])
    }

  }
}

export default user

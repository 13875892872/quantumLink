import { defineStore } from 'pinia'
import { type Ref } from 'vue'
import type { User } from '@/api/type/user'
import { cloneDeep } from 'lodash'
import UserApi from '@/api/user'
import ThemeApi from '@/api/theme'
import { useElementPlusTheme } from 'use-element-plus-theme'
import { defaultPlatformSetting } from '@/utils/theme'
import { useLocalStorage } from '@vueuse/core'
import { localeConfigKey, getBrowserLang } from '@/locales/index'
export interface userStateTypes {
  userType: number // 1 系统操作者 2 对话用户
  userInfo: User | null
  token: any
  version?: string
  userAccessToken?: string
  XPACK_LICENSE_IS_VALID: false
  isXPack: false
  themeInfo: any
}

const useUserStore = defineStore({
  id: 'user',
  state: (): userStateTypes => ({
    userType: 1,
    userInfo: null,
    token: '',
    version: '',
    userAccessToken: '',
    XPACK_LICENSE_IS_VALID: false,
    isXPack: false,
    themeInfo: null
  }),
  actions: {
    getLanguage() {
      return this.userType === 1
        ? localStorage.getItem('MaxKB-locale') || getBrowserLang()
        : sessionStorage.getItem('language') || getBrowserLang()
    },
    showXpack() {
      return this.isXPack
    },
    isDefaultTheme() {
      return !this.themeInfo?.theme || this.themeInfo?.theme === '#3370FF'
    },
    setTheme(data: any) {
      const { changeTheme } = useElementPlusTheme(this.themeInfo?.theme)
      changeTheme(data?.['theme'])
      this.themeInfo = cloneDeep(data)
    },
    isExpire() {
      return this.isXPack && !this.XPACK_LICENSE_IS_VALID
    },
    isEnterprise() {
      return this.isXPack && this.XPACK_LICENSE_IS_VALID
    },
    getToken(): String | null {
      if (this.token) {
        return this.token
      }
      return this.userType === 1 ? localStorage.getItem('token') : this.getAccessToken()
    },
    getAccessToken() {
      const token = sessionStorage.getItem(`${this.userAccessToken}-accessToken`)
      if (token) {
        return token
      }
      const local_token = localStorage.getItem(`${this.userAccessToken}-accessToken`)
      if (local_token) {
        return local_token
      }
      return localStorage.getItem(`accessToken`)
    },

    getPermissions() {
      if (this.userInfo) {
        return this.isXPack && this.XPACK_LICENSE_IS_VALID
          ? [...this.userInfo?.permissions, 'x-pack']
          : this.userInfo?.permissions
      } else {
        return []
      }
    },
    getRole() {
      if (this.userInfo) {
        return this.userInfo?.role
      } else {
        return ''
      }
    },
    changeUserType(num: number, token?: string) {
      this.userType = num
      this.userAccessToken = token
    },

    async asyncGetProfile() {
      return new Promise((resolve, reject) => {
        UserApi.getProfile()
          .then(async (ok) => {
            this.version = ok.data?.version || '-'
            this.isXPack = ok.data?.IS_XPACK
            this.XPACK_LICENSE_IS_VALID = ok.data?.XPACK_LICENSE_IS_VALID

            if (this.isEnterprise()) {
              await this.theme()
            } else {
              this.themeInfo = {
                ...defaultPlatformSetting
              }
            }
            resolve(ok)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    async theme(loading?: Ref<boolean>) {
      return await ThemeApi.getThemeInfo(loading).then((ok) => {
        this.setTheme(ok.data)
        // window.document.title = this.themeInfo['title'] || 'MaxKB'
        // const link = document.querySelector('link[rel="icon"]') as any
        // if (link) {
        //   link['href'] = this.themeInfo['icon'] || '/favicon.jpg'
        // }
      })
    },

    async profile() {
      return UserApi.profile().then(async (ok) => {
        this.userInfo = ok.data
        useLocalStorage(localeConfigKey, 'en-US').value = ok.data?.language || this.getLanguage()
        return this.asyncGetProfile()
      })
    },

    async login(auth_type: string, username: string, password: string, captcha: string) {
      return UserApi.login(auth_type, { username, password, captcha }).then((ok) => {
        this.token = ok.data
        localStorage.setItem('token', ok.data)
        return this.profile()
      })
    },
    async dingCallback(code: string) {
      return UserApi.getDingCallback(code).then((ok) => {
        this.token = ok.data
        localStorage.setItem('token', ok.data)
        return this.profile()
      })
    },
    async dingOauth2Callback(code: string) {
      return UserApi.getDingOauth2Callback(code).then((ok) => {
        this.token = ok.data
        localStorage.setItem('token', ok.data)
        return this.profile()
      })
    },
    async wecomCallback(code: string) {
      return UserApi.getWecomCallback(code).then((ok) => {
        this.token = ok.data
        localStorage.setItem('token', ok.data)
        return this.profile()
      })
    },
    async larkCallback(code: string) {
      return UserApi.getlarkCallback(code).then((ok) => {
        this.token = ok.data
        localStorage.setItem('token', ok.data)
        return this.profile()
      })
    },

    async logout() {
      return UserApi.logout().then(() => {
        localStorage.removeItem('token')
        return true
      })
    },
    async getAuthType() {
      return UserApi.getAuthType().then((ok) => {
        return ok.data
      })
    },
    async getQrType() {
      return UserApi.getQrType().then((ok) => {
        return ok.data
      })
    },
    async getQrSource() {
      return UserApi.getQrSource().then((ok) => {
        return ok.data
      })
    },
    async postUserLanguage(lang: string, loading?: Ref<boolean>) {
      return new Promise((resolve, reject) => {
        UserApi.postLanguage({ language: lang }, loading)
          .then(async (ok) => {
            useLocalStorage(localeConfigKey, 'en-US').value = lang
            window.location.reload()
            resolve(ok)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }
  }
})

export default useUserStore

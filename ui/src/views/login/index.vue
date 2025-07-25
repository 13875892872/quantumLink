<template>
  <login-layout v-if="!loading" v-loading="loading">
    <LoginContainer>
      <h2 class="mb-4 text-center" style="color: #60bff3;" v-if="!showQrCodeTab">{{ loginMode || $t('views.login.title') }}</h2>
      <img
         src="@/assets/logo/login-bt1.png"
         alt="Login Illustration"
         style="
             width: 80px;          /* 固定宽度 */
             height: 15px;          /* 高度自动（保持比例） */
             margin: 0px auto 10px ;     /* 上下边距 20px，左右自动（水平居中） */
             display: block;        /* 让 margin: auto 生效 */
         "
      >
      <div v-if="!showQrCodeTab">
        <el-form
          class="login-form"
          :rules="rules"
          :model="loginForm"
          ref="loginFormRef"
          @keyup.enter="login"
        >
          <div class="mb-24">
            <el-form-item prop="username">
              <el-input
                size="large"
                class="input-item rounded-input"
                v-model="loginForm.username"

                :placeholder="$t('views.user.userForm.form.username.placeholder')"
              >
                 <!-- 左侧插槽（prefix） -->
              <template #prefix>
                <img src="@/assets/iconsimg/userImg.png"  style="width: 10px; height: 10px;"/>
              </template>
              </el-input>
            </el-form-item>
          </div>
          <div class="mb-24">
            <el-form-item prop="password">
              <el-input
                type="password"
                size="large"
                class="input-item rounded-input"
                v-model="loginForm.password"

                :placeholder="$t('views.user.userForm.form.password.placeholder')"
                show-password
              >
                 <!-- 左侧插槽（prefix） -->
              <template #prefix>
                <img src="@/assets/iconsimg/passwordImg.png"  style="width: 10px; height: 10px;"/>
              </template>
              </el-input>
            </el-form-item>
          </div>
          <div class="mb-24">
            <el-form-item prop="captcha">
              <div class="flex-between w-full">
                <el-input
                  size="large"
                  class="input-item rounded-input"
                  v-model="loginForm.captcha"
                  :placeholder="$t('views.user.userForm.form.captcha.placeholder')"
                >
                <template #prefix>
                  <img src="@/assets/iconsimg/verifyCodeImg.png"  style="width: 10px; height: 10px;"/>
                </template>
                </el-input>

                <img :src="identifyCode" alt="" height="38" class="ml-8 cursor border border-r-4" @click="makeCode" />
              </div>
            </el-form-item>
          </div>
        </el-form>

        <div class="operate-container flex-between" style="margin-top: -10px">
          <!-- <el-button class="register" @click="router.push('/register')" link type="primary">
          注册
        </el-button> -->
          <el-button
            class="forgot-password"
            style="color: #60bff3;"
            @click="router.push('/forgot_password')"
            link
            type="primary"
          >
            {{ $t('views.login.forgotPassword') }}?
          </el-button>
        </div>
        <el-button size="large" type="primary" class="w-full" @click="login" style="margin-top: 10px;background-color: #ffffff !important; /* 去掉背景色 */
                           border-radius: 15px !important; /* 大圆角（或指定具体值，如 8px） */
                           color: #000 !important; /* 字体黑色 */
                           border: none !important; /* 可选：去掉边框 */"
          >{{ $t('views.login.buttons.login') }}
        </el-button>
      </div>
      <div v-if="showQrCodeTab">
        <QrCodeTab :tabs="orgOptions" />
      </div>

      <div class="login-gradient-divider lighter mt-24" v-if="modeList.length > 1">
        <span>{{ $t('views.login.moreMethod') }}</span>
      </div>
      <div class="text-center mt-16">
        <template v-for="item in modeList">
          <el-button
            v-if="item !== '' && loginMode !== item && item !== 'QR_CODE'"
            circle
            :key="item"
            class="login-button-circle color-secondary"
            @click="changeMode(item)"
          >
            <span
              :style="{
                'font-size': item === 'OAUTH2' ? '8px' : '10px',
                color: user.themeInfo?.theme
              }"
              >{{ item }}</span
            >
          </el-button>
          <el-button
            v-if="item === 'QR_CODE' && loginMode !== item"
            circle
            :key="item"
            class="login-button-circle color-secondary"
            @click="changeMode('QR_CODE')"
          >
            <img src="@/assets/icon_qr_outlined.svg" width="25px" />
          </el-button>
          <el-button
            v-if="item === '' && loginMode !== ''"
            circle
            :key="item"
            class="login-button-circle color-secondary"
            style="font-size: 24px"
            icon="UserFilled"
            @click="changeMode('')"
          />
        </template>
      </div>
    </LoginContainer>
  </login-layout>
</template>
<script setup lang="ts">
import { onMounted, ref, onBeforeMount } from 'vue'
import type { LoginRequest } from '@/api/type/user'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import useStore from '@/stores'
import authApi from '@/api/auth-setting'
import useApi from '@/api/user'
import { MsgConfirm, MsgError, MsgSuccess } from '@/utils/message'

import { t, getBrowserLang } from '@/locales'
import QrCodeTab from '@/views/login/components/QrCodeTab.vue'
import { useI18n } from 'vue-i18n'
import * as dd from 'dingtalk-jsapi'
import { loadScript } from '@/utils/utils'
const { locale } = useI18n({ useScope: 'global' })
const loading = ref<boolean>(false)
const { user } = useStore()
const router = useRouter()
const loginForm = ref<LoginRequest>({
  username: '',
  password: '',
  captcha: ''
})
const identifyCode = ref<string>('')
function makeCode() {
  useApi.getCaptcha().then((res: any) => {
    identifyCode.value = res.data
  })
}
const rules = ref<FormRules<LoginRequest>>({
  username: [
    {
      required: true,
      message: t('views.user.userForm.form.username.requiredMessage'),
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: t('views.user.userForm.form.password.requiredMessage'),
      trigger: 'blur'
    }
  ],
  captcha: [
    {
      required: true,
      message: t('views.user.userForm.form.captcha.placeholder'),
      trigger: 'blur'
    }
  ]
})
const loginFormRef = ref<FormInstance>()

const modeList = ref<string[]>([''])
const QrList = ref<any[]>([''])
const loginMode = ref('')
const showQrCodeTab = ref(false)

interface qrOption {
  key: string
  value: string
}

const orgOptions = ref<qrOption[]>([])

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function redirectAuth(authType: string) {
  if (authType === 'LDAP' || authType === '') {
    return
  }
  authApi.getAuthSetting(authType, loading).then((res: any) => {
    if (!res.data) {
      return
    }
    MsgConfirm(t('views.login.jump_tip'), '', {
      confirmButtonText: t('views.login.jump'),
      cancelButtonText: t('common.cancel'),
      confirmButtonClass: ''
    })
      .then(() => {
        if (!res.data.config_data) {
          return
        }
        const config = res.data.config_data
        const redirectUrl = eval(`\`${config.redirectUrl}\``)
        let url
        if (authType === 'CAS') {
          url = config.ldpUri
          if (url.indexOf('?') !== -1) {
            url = `${config.ldpUri}&service=${encodeURIComponent(redirectUrl)}`
          } else {
            url = `${config.ldpUri}?service=${encodeURIComponent(redirectUrl)}`
          }
        }
        if (authType === 'OIDC') {
          const scope = config.scope || 'openid+profile+email'
          url = `${config.authEndpoint}?client_id=${config.clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${scope}`
          if (config.state) {
            url += `&state=${config.state}`
          }
        }
        if (authType === 'OAuth2') {
          url =
            `${config.authEndpoint}?client_id=${config.clientId}&response_type=code` +
            `&redirect_uri=${redirectUrl}&state=${uuidv4()}`
          if (config.scope) {
            url += `&scope=${config.scope}`
          }
        }
        if (url) {
          window.location.href = url
        }
      })
      .catch(() => {})
  })
}

function changeMode(val: string) {
  loginMode.value = val === 'LDAP' ? val : ''
  if (val === 'QR_CODE') {
    loginMode.value = val
    showQrCodeTab.value = true
    return
  }
  showQrCodeTab.value = false
  loginForm.value = {
    username: '',
    password: '',
    captcha: ''
  }
  redirectAuth(val)
  loginFormRef.value?.clearValidate()
}

const login = () => {
  loginFormRef.value?.validate().then(() => {
    loading.value = true
    user
      .login(
        loginMode.value,
        loginForm.value.username,
        loginForm.value.password,
        loginForm.value.captcha
      )
      .then(() => {
        locale.value = localStorage.getItem('MaxKB-locale') || getBrowserLang() || 'en-US'
        router.push({ name: 'home' })
      })
      .finally(() => (loading.value = false))
  })
}

onBeforeMount(() => {
  loading.value = true
  user.asyncGetProfile().then((res) => {
    if (user.isEnterprise()) {
      user
        .getAuthType()
        .then((res) => {
          //如果结果包含LDAP，把LDAP放在第一个
          const ldapIndex = res.indexOf('LDAP')
          if (ldapIndex !== -1) {
            const [ldap] = res.splice(ldapIndex, 1)
            res.unshift(ldap)
          }
          modeList.value = [...modeList.value, ...res]
        })
        .finally(() => (loading.value = false))
      user
        .getQrType()
        .then((res) => {
          if (res.length > 0) {
            modeList.value = ['QR_CODE', ...modeList.value]
            QrList.value = res
            QrList.value.forEach((item) => {
              orgOptions.value.push({
                key: item,
                value:
                  item === 'wecom'
                    ? t('views.system.authentication.scanTheQRCode.wecom')
                    : item === 'dingtalk'
                      ? t('views.system.authentication.scanTheQRCode.dingtalk')
                      : t('views.system.authentication.scanTheQRCode.lark')
              })
            })
          }
        })
        .finally(() => (loading.value = false))
    } else {
      loading.value = false
    }
  })
})
declare const window: any

onMounted(() => {
  makeCode()
  const route = useRoute()
  const currentUrl = ref(route.fullPath)
  const params = new URLSearchParams(currentUrl.value.split('?')[1])
  const client = params.get('client')

  const handleDingTalk = () => {
    const code = params.get('corpId')
    if (code) {
      dd.runtime.permission.requestAuthCode({ corpId: code }).then((res) => {
        console.log('DingTalk client request success:', res)
        user.dingOauth2Callback(res.code).then(() => {
          router.push({ name: 'home' })
        })
      })
    }
  }

  const handleLark = () => {
    const appId = params.get('appId')
    const callRequestAuthCode = () => {
      window.tt?.requestAuthCode({
        appId: appId,
        success: (res: any) => {
          user.larkCallback(res.code).then(() => {
            router.push({ name: 'home' })
          })
        },
        fail: (error: any) => {
          MsgError(error)
        }
      })
    }

    loadScript('https://lf-scm-cn.feishucdn.com/lark/op/h5-js-sdk-1.5.35.js', {
      jsId: 'lark-sdk',
      forceReload: true
    })
      .then(() => {
        if (window.tt) {
          window.tt.requestAccess({
            appID: appId,
            scopeList: [],
            success: (res: any) => {
              user.larkCallback(res.code).then(() => {
                router.push({ name: 'home' })
              })
            },
            fail: (error: any) => {
              const { errno } = error
              if (errno === 103) {
                callRequestAuthCode()
              }
            }
          })
        } else {
          callRequestAuthCode()
        }
      })
      .catch((error) => {
        console.error('SDK 加载失败:', error)
      })
  }

  switch (client) {
    case 'dingtalk':
      handleDingTalk()
      break
    case 'lark':
      handleLark()
      break
    default:
      break
  }
})
</script>
<style lang="scss" scoped>
.login-gradient-divider {
  position: relative;
  text-align: center;
  color: var(--el-color-info);

  ::before {
    content: '';
    width: 25%;
    height: 1px;
    background: linear-gradient(90deg, rgba(222, 224, 227, 0) 0%, #dee0e3 100%);
    position: absolute;
    left: 16px;
    top: 50%;
  }

  ::after {
    content: '';
    width: 25%;
    height: 1px;
    background: linear-gradient(90deg, #dee0e3 0%, rgba(222, 224, 227, 0) 100%);
    position: absolute;
    right: 16px;
    top: 50%;
  }
}

.login-button-circle {
  padding: 20px !important;
  margin: 0 4px;
  width: 32px;
  height: 32px;
  text-align: center;
}
/* 覆盖输入框样式  自动填充有问题优化*/
:deep(.el-input__inner:-webkit-autofill),
:deep(.el-input__inner:-webkit-autofill:hover),
:deep(.el-input__inner:-webkit-autofill:focus),
:deep(.el-input__inner:-webkit-autofill:active) {
    background-color: #ffffff !important;
    color: #000000 !important;
    box-shadow: 0 0 0 1000px #ffffff inset !important;
    -webkit-text-fill-color: #000000 !important;
    transition: background-color 9999s ease-out !important;
}

:deep(.el-input__inner:-internal-autofill-selected),
:deep(.el-input__inner:autofill) {
    background-color: #ffffff !important;
    color: #000000 !important;
    box-shadow: 0 0 0 1000px #ffffff inset !important;
}

/* 覆盖输入框整体样式 */
:deep(.el-form-item .rounded-input.el-input .el-input__wrapper) {
    background-color: #ffffff !important;
    border-radius: 15px !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 12px !important;
}

</style>

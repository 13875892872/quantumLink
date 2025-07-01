<template>
  <div class="login-warp flex-center">
    <div class="login-container w-full h-full">
      <el-row class="container w-full h-full">
        <el-col :xs="0" :sm="0" :md="10" :lg="10" :xl="10" class="left-container">
<!--          <div class="login-image" :style="{ backgroundImage: `url(${loginImage})` }"></div>-->
        </el-col>
        <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14" class="right-container flex-center-glf">
          <el-dropdown trigger="click" type="primary" class="lang" v-if="lang">
            <template #dropdown>
              <el-dropdown-menu style="width: 180px">
                <el-dropdown-item
                  v-for="(lang, index) in langList"
                  :key="index"
                  :value="lang.value"
                  @click="changeLang(lang.value)"
                  class="flex-between"
                >
                  <span :class="lang.value === user.getLanguage() ? 'primary' : ''">{{
                    lang.label
                  }}</span>

                  <el-icon
                    :class="lang.value === user.getLanguage() ? 'primary' : ''"
                    v-if="lang.value === user.getLanguage()"
                  >
                    <Check />
                  </el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
            <el-button>
              {{ currentLanguage }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
          </el-dropdown>
          <slot></slot>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { getThemeImg } from '@/utils/theme'
import useStore from '@/stores'
import { useLocalStorage } from '@vueuse/core'
import { langList, localeConfigKey, getBrowserLang } from '@/locales/index'
defineProps({
  lang: {
    type: Boolean,
    default: false
  }
})
defineOptions({ name: 'LoginLayoutCustomer' })
const { user } = useStore()

const changeLang = (lang: string) => {
  useLocalStorage(localeConfigKey, getBrowserLang()).value = lang
  window.location.reload()
}

const currentLanguage = computed(() => {
  return langList.value?.filter((v: any) => v.value === user.getLanguage())?.[0]?.label
})

const fileURL = computed(() => {
  if (user.themeInfo?.loginImage) {
    if (typeof user.themeInfo?.loginImage === 'string') {
      return user.themeInfo?.loginImage
    } else {
      return URL.createObjectURL(user.themeInfo?.loginImage)
    }
  } else {
    return ''
  }
})

const loginImage = computed(() => {
  if (user.themeInfo?.loginImage) {
    return `${fileURL.value}`
  } else {
    return new URL(`../../assets/theme/${getThemeImg(user.themeInfo?.theme)}.jpg`, import.meta.url)
      .href
  }
})
</script>
<style lang="scss" scoped>
.login-warp {
  height: 100vh;

  .login-image {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    width: 100%;
    height: 100%;
  }
  .right-container {
    position: relative;
    .lang {
      position: absolute;
      right: 20px;
      top: 20px;
    }
  }
  .flex-center-glf{
     display: flex;
     margin-top: 170px;
     //align-items: center;
     justify-content: center;
  }

  .container{
     background-image:
       // url('@/assets/logo/login_formbg.png'),
        url('@/assets/customerlogo/login_font.png'),
        url('@/assets/customerlogo/login.jpg');


    background-position:
       // right 230px top 170px, /* 图2右上角偏移 */
        right 800px top 280px, /* 图2右上角偏移 */
        center center; /* 图1居中 */


    /* 分别控制每张图的尺寸 */
    background-size:
     //  423px 510px,   /* 图2宽度100px */
       500px 300px,   /* 图2宽度100px */
       cover;


      // cover;          /* 图1覆盖容器 */
      // contain;        /* 图3完整显示 */
      background-repeat: no-repeat
  }
  .el-button el-button--primary el-button--large w-full {

    --el-button-bg-color: #dee0e3;

  }
}
</style>

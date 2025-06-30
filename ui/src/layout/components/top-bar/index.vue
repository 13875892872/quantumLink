<template>
  <div class="top-bar-container border-b flex-between">
    <div class="flex-center h-full">
      <TopMenu></TopMenu>
    </div>
    <div class="flex-center avatar" >
      <Avatar></Avatar>
      <!-- <el-dropdown trigger="click" type="primary">
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(lang, index) in langList"
              :key="index"
              :value="lang.value"
              @click="changeLang(lang.value)"
              >{{ lang.label }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
        <AppIcon
          iconName="app-translate"
          class="cursor color-secondary mr-16 ml-8"
          style="font-size: 20px"
        >
        </AppIcon>
      </el-dropdown> -->
    </div>
  </div>
</template>
<script setup lang="ts">
import TopMenu from './top-menu/index.vue'
import Avatar from './avatar/index.vue'
import { useRouter } from 'vue-router'
// import { langList } from '@/locales/index'
// import { useLocale } from '@/locales/useLocale'

import useStore from '@/stores'
const { user } = useStore()
const router = useRouter()

// const { changeLocale } = useLocale()
// const changeLang = (lang: string) => {
//   changeLocale(lang)
// }
function toUrl(url: string) {
  window.open(url, '_blank')
}
</script>
<style lang="scss">
.top-bar-container {
  height: var(--app-header-height);
  box-sizing: border-box;
  padding: var(--app-header-padding);
  margin-left: 35%  !important;
  .app-title-container {
    margin-right: 45px;
  }

  .line {
    height: 2em;
  }
}
</style>

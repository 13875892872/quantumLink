<template>
  <div class="app-header" :class="!isDefaultTheme ? 'custom-header' : ''">
    <el-alert
      v-if="user.isExpire()"
      :title="$t('layout.isExpire')"
      type="warning"
      class="border-b"
      show-icon
      :closable="false"
    />
    <TopBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TopBar from '../top-bar/index.vue'
import useStore from '@/stores'
const { user } = useStore()
const isDefaultTheme = computed(() => {
  return user.isDefaultTheme()
})
</script>

<style lang="scss" scoped>
.app-header {
  background: var(--app-header-bg-color);
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 100;
}
/* 使用 ::after 添加额外图片 */
.app-header::before {
  content: "";
  position: absolute;
  //top: 0%; /* 垂直居中 */
  //left: 20px; /* 距离左侧 20px */
  transform: translateY(-50%); /* 微调垂直居中 */
  width: 400px; /* 图片宽度 */
  height: 400px; /* 图片高度 */
  background: url('@/assets/homeicons/appliction-tb.png') no-repeat 20% 57% / 30% 10%; /* 图片路径 */
  pointer-events: none; /* 防止图片阻挡点击事件 */
}
</style>

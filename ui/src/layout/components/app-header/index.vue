<template>
  <div class="app-header" :class="!isDefaultTheme ? 'custom-header' : ''">
    <img
    src="@/assets/homeicons/appliction-tb.png"
    class="header-image"
    @click="router.push('/application')"
  />
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
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()
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
/* 使用 ::after 添加额外图片  改为上面直接添加图片*/
/*.app-header::before {
  content: "";
  position: absolute;
  top: 5px; !* 垂直居中 *!
  //left: 20px; !* 距离左侧 20px *!
  transform: translateY(-50%); !* 微调垂直居中 *!
  width: 480px; !* 图片宽度 *!
  height: 400px; !* 图片高度 *!
  background: url('@/assets/homeicons/appliction-tb.png') no-repeat 20% 57% / 30% 10%; !* 图片路径 *!
  pointer-events: none; !* 防止图片阻挡点击事件 *!
}*/
.app-header {
  //position: relative;
}

.header-image {
  position: absolute;
  top: 10px;
  left: 60px;
  width: 150px;
  height: 40px;
  //object-fit: contain; /* 保持图片比例 */
  cursor: pointer; /* 鼠标悬停时显示手型 */
}
</style>

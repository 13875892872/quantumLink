<template>
  <div
    class="menu-item-container flex-center h-full"
    :class="isActive ? 'active' : ''"
    @click="goToRoute(menu.name)"
  >

<!--      <AppIcon :iconName="menu.meta ? (menu.meta.icon as string) : '@/assets/homeicons/appliction-x.png'" />-->
<!--      <AppIcon iconName="app-view" />-->
      <svg width="30" height="30">
        <image
          href="@/assets/homeicons/appliction-x.png"
          x="4"
          y="5"
          width="20"
          height="20"
        />
     </svg>

    <div class="title">
      {{ $t(menu.meta?.title as string) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter, useRoute, type RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'
const router = useRouter()
const route = useRoute()

const props = defineProps<{
  menu: RouteRecordRaw
}>()

const isActive = computed(() => {
  const { name, path, meta } = route
  return (name == props.menu.name && path == props.menu.path) || meta?.activeMenu == props.menu.path
})

function  goToRoute(name ) {
  debugger
  //  window.location.origin
  //window.location.href = '/ui/' + name;
  //router.push({ name: name })
  // function-lib
  if('function_lib' == name){
   // window.location.href = '/ui/function-lib'
    window.location.replace('/ui/function-lib');
   // this.$router.push('/function-lib');
  }else if ('dataset' == name) {
    //window.location.href =  '/ui/dataset'
    window.location.replace('/ui/dataset');
   //  this.$router.push('/dataset');
  }else{
    router.push({ path: `/${name}` });
  }

}
</script>
<style lang="scss" scoped>
.menu-item-container {
  margin-right: 28px;
  cursor: pointer;
  font-size: 16px;
  position: relative;
  color: #ffffff; // 默认颜色
  .icon {
    font-size: 15px;
    margin-right: 5px;
    margin-top: 2px;
  }

  &:hover {
    //color: var(--el-color-primary);
  }
}

.active {
  //color: var(--el-color-primary);
  color: white;  // 选择后的颜色
  &::after {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 2px;
    content: '';
    background-color: var(--el-color-primary-light-9);
    border-bottom: 3px solid var(--el-color-primary);
  }
}
</style>

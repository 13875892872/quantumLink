<template>
    <div class="login-form-container-c">
      <div class="login-title">
        <div class="logo text-center">
          <LogoFull height="45px" />
        </div>
        <div class="sub-title text-center" v-if="subTitle">
          <el-text type="info">{{ subTitle }}</el-text>
        </div>
      </div>
      <el-card class="login-card">
        <slot></slot>
      </el-card>
    </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'LoginContainerCustomer' })
defineProps({
  title: String,
  subTitle: String
})
</script>
<style lang="scss" scoped>
.login-form-container-c {
  position: relative;
  width: 420px;
  //height: 75%;
  //border-radius: 100px; /* 确保容器本身也有圆角 */
  .login-title {
    margin-bottom: 32px;
    .sub-title {
      font-size: 16px;
    }
  }
  .login-card {
    //height: 59.5%;
    border-radius: 40px;
    padding: 10px;
    background-color: transparent !important; /* 强制透明 */
    background: transparent !important; /* 覆盖所有背景属性 */
    border: none !important; /* 移除边框 */
    box-shadow: none !important; /* 移除阴影 */
    outline: none !important; /* 移除轮廓线 */
  }
}

.login-form-container-c::before {
  content: '';
  position: absolute;
  top: 4px; /* 调整位置 */
  left: 0;
  width: 100%; /* 改为 100% 填充容器 */
  height: 520px;
  background-image: url('@/assets/customerlogo/login_formbg.png'); /* 尝试 ~@/ 或 @/ */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 0; /* 确保在内容下方 */
  border-radius: 40px; /* 与 .login-card 的圆角一致 */
  pointer-events: none; /* 可选：防止伪元素阻挡交互 */
  //opacity: 0.5; /* 可选：调整透明度 */
 // opacity: 0.5; /* 设置透明度，0.5表示50%透明度 */
}
.login-form-container-c .login-card {
  position: relative; /* 确保内容在伪元素上方 */
  z-index: 1; /* 确保内容在伪元素上方 */
  border-radius: 40px;
  height: 380px;
}
</style>

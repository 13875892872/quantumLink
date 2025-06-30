<template>
  <div class="app-container">

     <div class="menu-center-container">
       <div style="width: 90%">
          <el-menu
            mode="horizontal"
            :default-active="activeIndex"
            @select="handleSelect"
            style="width: 20%;height: 100%; margin-left: 45%"
            class="custom-menu"
          >
            <el-menu-item index="1">工作台</el-menu-item>
            <el-menu-item index="2">系统设置</el-menu-item>
         </el-menu>
       </div>
       <div class="flex-center avatar">
          <Avatar></Avatar>
      </div>
    </div>
    <div  @click="jumpAi()" class="jump-link"
    style="position: absolute; right : 72.5% ;top : 32%;width: 19%; height: 19%; "></div>
     <div  @click="jumpHome()" class="jump-link"
    style="position: absolute; right : 52.5% ;top : 32%;width: 19%; height: 19%; " ></div>
    <div style="transform: translateX(10%); margin-top: 19%">
      <div style="width: 50%; height: 50%">
        <div style="font-size: 20px;font-weight: bold"> 智能公文写作</div>
        <div style="font-size: 10px"> 智能公文辅助写作平台</div>
      </div>
    </div>
    <div style="transform: translateX(30%); margin-top: -3%">
      <div style="width: 50%; height: 50%;">
        <div style="font-size: 20px;font-weight: bold"> 知识库</div>
        <div style="font-size: 10px"> 智能知识库</div>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import applicationApi from '@/api/application'
import { MsgSuccess, MsgConfirm, MsgAlert, MsgError } from '@/utils/message'
import { useRouter } from 'vue-router'
import { isWorkFlow } from '@/utils/application'
import { ValidType, ValidCount } from '@/enums/common'
import {getBrowserLang, t} from '@/locales'
import useStore from '@/stores'
import Avatar from './avatar/index.vue'


const elUploadRef = ref<any>()
const { application, user, common } = useStore()
const router = useRouter()

const CopyApplicationDialogRef = ref()
const CreateApplicationDialogRef = ref()
const loading = ref(false)

const applicationList = ref<any[]>([])

const paginationConfig = reactive({
  current_page: 1,
  page_size: 30,
  total: 0
})

interface UserOption {
  label: string
  value: string
}

const userOptions = ref<UserOption[]>([])

const selectUserId = ref('all')

const searchValue = ref('')

const apiInputParams = ref([])

function copyApplication(row: any) {
  application.asyncGetApplicationDetail(row.id, loading).then((res: any) => {
    if (res?.data) {
      CopyApplicationDialogRef.value.open({ ...res.data, model_id: res.data.model })
    }
  })
}

const is_show_copy_button = (row: any) => {
  return user.userInfo ? user.userInfo.id == row.user_id : false
}

function settingApplication(row: any) {
  if (isWorkFlow(row.type)) {
    router.push({ path: `/application/${row.id}/workflow` })
  } else {
    router.push({ path: `/application/${row.id}/${row.type}/setting` })
  }
}

const exportApplication = (application: any) => {
  applicationApi.exportApplication(application.id, application.name, loading).catch((e) => {
    if (e.response.status !== 403) {
      e.response.data.text().then((res: string) => {
        MsgError(`${t('views.application.tip.ExportError')}:${JSON.parse(res).message}`)
      })
    }
  })
}
const importApplication = (file: any) => {
  const formData = new FormData()
  formData.append('file', file.raw, file.name)
  elUploadRef.value.clearFiles()
  applicationApi
    .importApplication(formData, loading)
    .then(async (res: any) => {
      if (res?.data) {
        searchHandle()
      }
    })
    .catch((e) => {
      if (e.code === 400) {
        MsgConfirm(t('common.tip'), t('views.application.tip.professionalMessage'), {
          cancelButtonText: t('common.confirm'),
          confirmButtonText: t('common.professional')
        }).then(() => {
          window.open('https://maxkb.cn/pricing.html', '_blank')
        })
      }
    })
}

function openCreateDialog() {
  common
    .asyncGetValid(ValidType.Application, ValidCount.Application, loading)
    .then(async (res: any) => {
      if (res?.data) {
        CreateApplicationDialogRef.value.open()
      } else if (res?.code === 400) {
        MsgConfirm(t('common.tip'), t('views.application.tip.professionalMessage'), {
          cancelButtonText: t('common.confirm'),
          confirmButtonText: t('common.professional')
        }).then(() => {
          window.open('https://maxkb.cn/pricing.html', '_blank')
        })
      }
    })
}

function searchHandle() {
  if (user.userInfo) {
    localStorage.setItem(user.userInfo.id + 'application', selectUserId.value)
  }
  applicationList.value = []
  paginationConfig.current_page = 1
  paginationConfig.total = 0
  getList()
}

function mapToUrlParams(map: any[]) {
  const params = new URLSearchParams()

  map.forEach((item: any) => {
    params.append(encodeURIComponent(item.name), encodeURIComponent(item.value))
  })

  return params.toString() // 返回 URL 查询字符串
}

function getAccessToken(id: string) {
  applicationList.value
    .filter((app) => app.id === id)[0]
    ?.work_flow?.nodes?.filter((v: any) => v.id === 'base-node')
    .map((v: any) => {
      apiInputParams.value = v.properties.api_input_field_list
        ? v.properties.api_input_field_list.map((v: any) => {
            return {
              name: v.variable,
              value: v.default_value
            }
          })
        : v.properties.input_field_list
          ? v.properties.input_field_list
              .filter((v: any) => v.assignment_method === 'api_input')
              .map((v: any) => {
                return {
                  name: v.variable,
                  value: v.default_value
                }
              })
          : []
    })

  const apiParams = mapToUrlParams(apiInputParams.value)
    ? '?' + mapToUrlParams(apiInputParams.value)
    : ''
  application.asyncGetAccessToken(id, loading).then((res: any) => {
    window.open(application.location + res?.data?.access_token + apiParams)
  })
}

function deleteApplication(row: any) {
  MsgConfirm(
    // @ts-ignore
    `${t('views.application.delete.confirmTitle')}${row.name} ?`,
    t('views.application.delete.confirmMessage'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      confirmButtonClass: 'danger'
    }
  )
    .then(() => {
      applicationApi.delApplication(row.id, loading).then(() => {
        const index = applicationList.value.findIndex((v) => v.id === row.id)
        applicationList.value.splice(index, 1)
        MsgSuccess(t('common.deleteSuccess'))
      })
    })
    .catch(() => {})
}

function getList() {
  const params = {
    ...(searchValue.value && { name: searchValue.value }),
    ...(selectUserId.value &&
      selectUserId.value !== 'all' && { select_user_id: selectUserId.value })
  }
  applicationApi.getApplication(paginationConfig, params, loading).then((res) => {
    res.data.records.forEach((item: any) => {
      if (user.userInfo && item.user_id === user.userInfo.id) {
        item.username = user.userInfo.username
      } else {
        item.username = userOptions.value.find((v) => v.value === item.user_id)?.label
      }
    })
    applicationList.value = [...applicationList.value, ...res.data.records]
    paginationConfig.total = res.data.total
  })
}

function getUserList() {
  applicationApi.getUserList('APPLICATION', loading).then((res) => {
    if (res.data) {
      userOptions.value = res.data.map((item: any) => {
        return {
          label: item.username,
          value: item.id
        }
      })
      if (user.userInfo) {
        const selectUserIdValue = localStorage.getItem(user.userInfo.id + 'application')
        if (selectUserIdValue && userOptions.value.find((v) => v.value === selectUserIdValue)) {
          selectUserId.value = selectUserIdValue
        }
      }
      getList()
    }
  })
}

onMounted(() => {
  getUserList()
})

function jumpAi(){
  debugger
  const token = localStorage.getItem('token');
  if(token){
     const partBeforeColon = token.split(':')[0]; // 截取第一个冒号前的部分
     window.open(  "http://183.222.164.36:60180/#/?ticket="+partBeforeColon);
    // window.open("http://www.baidu.com"); // 跳转页面成功
  }
}

function jumpHome(){
  debugger
  // 跳转管理后端
  router.push({ name: 'home' })
}

// 默认选中第一个菜单项（index="1"）
const activeIndex = ref("1")

const handleSelect = (index: string) => {
  activeIndex.value = index
  console.log("选中的菜单项:", index)
}

</script>
<style lang="scss" scoped>
/* 外层容器背景图片 */
.menu-center-container {
   display: flex;
  justify-content: center; /* 水平居中 */
  width: 100%;
  height: 7%;
  background-color: #d6e2ff;
   background-image:
       // url('@/assets/logo/login.png'),
        url('@/assets/customerHome/home-tb.png'),
        url('@/assets/customerHome/home-jx.png');


    background-position:
      //  center center, /* 图2右上角偏移 */
        right 94% top 50%, /* 图2右上角偏移 */
        center center; /* 图1居中 */


    /* 分别控制每张图的尺寸 */
    background-size:
      // 423px 510px,   /* 图2宽度100px */
       8% 70%,  /* 图2宽度100px */
       cover;


      // cover;          /* 图1覆盖容器 */
      // contain;        /* 图3完整显示 */
      background-repeat: no-repeat
}
/* 菜单样式（半透明背景 + 白色文字） */
.custom-menu {
  width: 300px;
  background-color: rgba(255, 255, 255, 0); /* 半透明白色背景，避免文字与背景冲突 */
  border-radius: 8px; /* 圆角效果 */
  backdrop-filter: blur(5px); /* 毛玻璃效果（可选，兼容性需测试） */
}

/* 菜单项文字颜色 */
.custom-menu .el-menu-item {
  color: #333 !important; /* 深色文字（适配浅色背景） */
}

/* 选中/悬停状态 */
.custom-menu .el-menu-item.is-active,
.custom-menu .el-menu-item:hover {
  color: #409eff !important; /* 蓝色高亮 */
  border-bottom-color: #409eff !important;
}
/*
.menu-center-container {
  display: flex;
  justify-content: center; !* 水平居中 *!
  width: 100%;
  height: 7%;
}*/

/* 可选：调整菜单内边距或样式 */
.el-menu--horizontal {
  display: inline-flex; /* 让菜单宽度自适应内容 */
  border-bottom: none; /* 去掉默认下边框（可选） */
}

/* 可选：调整菜单项间距 */
.el-menu--horizontal .el-menu-item {
  margin: 0 10px;
}
.app-container {
  width: 100%;
  height: 100%;
  background-image:
       url('@/assets/customerHome/home-link2.png'),
       url('@/assets/customerHome/home-link1.png'),
       url('@/assets/customerHome/home-link.png'),
       url('@/assets/customerHome/home-link.png'),
       url('@/assets/customerHome/home-jxbig.png'),
       url('@/assets/customerHome/home-welcome.png'),
       url('@/assets/customerHome/home.png');
  background-position:
        right 69% top 38%, /* 图2右上角偏移 */
        right 90% top 37%, /* 图2右上角偏移 */
        right 65% top 40%, /* 图2右上角偏移 */
        right 90% top 40%, /* 图2右上角偏移 */
        right 60% top 110%, /* 图2右上角偏移 */
        right 60% top 8%, /* 图2右上角偏移 */
        center center; /* 图1居中 */
  background-size:
       4% 8%,  /* 图2宽度100px */
       4% 8%,  /* 图2宽度100px */
       20% 20%,  /* 图2宽度100px */
       20% 20%,  /* 图2宽度100px */
       90% 80%,  /* 图2宽度100px */
       90% 20%,  /* 图2宽度100px */
       cover;
  background-repeat: no-repeat
}

/* 链接样式（透明但可点击） */
.jump-link {
  display: block;
  background: none;
  z-index: 10; /* 确保在背景图上方 */
}
</style>

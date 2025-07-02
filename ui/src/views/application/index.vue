<template>
  <div class="application-list-container p-24" style="padding-top: 16px">
    <div class="app_img"> </div>
    <div class="clickable-area create" @click="openCreateDialog"></div>
    <div class="clickable-area import" @click="triggerUpload">
      <el-upload
                    ref="elUploadRef"
                    :file-list="[]"
                    action="#"
                    multiple
                    :auto-upload="false"
                    :show-file-list="false"
                    :limit="1"
                    :on-change="(file: any, fileList: any) => importApplication(file)"
                    class="card-add-button"
                  >
    <!--                  <div class="flex align-center cursor p-8">
                        <AppIcon iconName="app-import" class="mr-8"></AppIcon>
                        {{ $t('views.application.importApplication') }}
                      </div>-->
                  </el-upload>
    </div>
    <div class="flex-between mb-16">
      <div class="title-with-icon" style="margin-left: 1%" >
        <AppIcon iconName="app-all-menu-active" style="display: inline-block;"/>
        <h4 style="display: inline-block;margin-left: 5px">{{ $t('views.application.title') }}</h4>
      </div>
      <div class="flex-between">
        <el-select
          v-model="selectUserId"
          class="mr-12"
          @change="searchHandle"
          style="max-width: 240px; width: 150px"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="searchValue"
          @change="searchHandle"
          :placeholder="$t('views.application.searchBar.placeholder')"
          prefix-icon="Search"
          class="w-240"
          style="min-width: 240px"
          clearable
        />
      </div>
    </div>
    <div v-loading.fullscreen.lock="paginationConfig.current_page === 1 && loading">
      <InfiniteScroll
        :size="applicationList.length"
        :total="paginationConfig.total"
        :page_size="paginationConfig.page_size"
        v-model:current_page="paginationConfig.current_page"
        @load="getList"
        :loading="loading"
      >
        <el-row :gutter="15">
<!--          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="mb-16">
            <el-card shadow="hover" class="application-card-add" style="&#45;&#45;el-card-padding: 8px">
              <div class="card-add-button flex align-center cursor p-8" @click="openCreateDialog">
                <AppIcon iconName="app-add-application" class="mr-8"></AppIcon>
                {{ $t('views.application.createApplication') }}
              </div>
              <el-divider style="margin: 8px 0" />
              <el-upload
                ref="elUploadRef"
                :file-list="[]"
                action="#"
                multiple
                :auto-upload="false"
                :show-file-list="false"
                :limit="1"
                :on-change="(file: any, fileList: any) => importApplication(file)"
                class="card-add-button"
              >
                <div class="flex align-center cursor p-8">
                  <AppIcon iconName="app-import" class="mr-8"></AppIcon>
                  {{ $t('views.application.importApplication') }}
                </div>
              </el-upload>
            </el-card>
          </el-col>-->
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="6"
            v-for="(item, index) in applicationList"
            :key="index"
            class="mb-16"

          >
            <CardBox
              :title="item.name"
              :description="item.desc"
              class="application-card cursor"
              :class="isWorkFlow(item.type) ? 'workflow-card' : 'simple-card'"
              @click="router.push({ path: `/application/${item.id}/${item.type}/overview` })"
            >
              <template #icon>
                <AppAvatar
                  v-if="isAppIcon(item?.icon)"
                  shape="square"
                  :size="32"
                  style="background: none"
                  class="mr-8"
                >
                  <img :src="item?.icon" alt="" />
                </AppAvatar>
                <AppAvatar
                  v-else-if="item?.name"
                  :name="item?.name"
                  pinyinColor
                  shape="square"
                  :size="32"
                  class="mr-8"
                />
              </template>
              <template #subTitle>
                <el-text class="color-secondary" size="small">
                  <auto-tooltip :content="item.username">
                    {{ $t('common.creator') }}: {{ item.username }}
                  </auto-tooltip>
                </el-text>
              </template>
<!--              <div class="status-tag">
                <el-tag type="warning" v-if="isWorkFlow(item.type)" style="height: 22px">
                  {{ $t('views.application.workflow') }}
                </el-tag>
                <el-tag class="blue-tag" v-else style="height: 22px">
                  {{ $t('views.application.simple') }}
                </el-tag>
              </div>-->

              <template #footer>
                <div class="footer-content">
                  <el-tooltip
                    effect="dark"
                    :content="$t('views.application.setting.demo')"
                    placement="top"
                  >
                    <el-button text @click.stop @click="getAccessToken(item.id)">
                      <AppIcon iconName="app-video-play"></AppIcon>
                    </el-button>
                  </el-tooltip>
                  <el-divider direction="vertical" />
                  <el-tooltip effect="dark" :content="$t('common.setting')" placement="top">
                    <el-button text @click.stop="settingApplication(item)">
<!--                      <AppIcon iconName="app-quote"></AppIcon>-->
                      <el-icon><Operation /></el-icon>  <!--用elementui图标-->
                    </el-button>
                  </el-tooltip>
                  <el-divider direction="vertical" />
                  <span @click.stop>
                    <el-dropdown trigger="click">
                      <el-button text @click.stop>
<!--                        <el-icon><MoreFilled /></el-icon>-->
                          <AppIcon iconName="app-all-menu"></AppIcon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-if="is_show_copy_button(item)"
                            @click="copyApplication(item)"
                          >
                            <AppIcon iconName="app-copy"></AppIcon>
                            {{ $t('common.copy') }}
                          </el-dropdown-item>
                          <el-dropdown-item @click.stop="exportApplication(item)">
                            <AppIcon iconName="app-export"></AppIcon>

                            {{ $t('common.export') }}
                          </el-dropdown-item>
                          <el-dropdown-item icon="Delete" @click.stop="deleteApplication(item)">{{
                            $t('common.delete')
                          }}</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </span>
                </div>
              </template>
            </CardBox>
          </el-col>
        </el-row>
      </InfiniteScroll>
    </div>
    <CreateApplicationDialog ref="CreateApplicationDialogRef" />
    <CopyApplicationDialog ref="CopyApplicationDialogRef" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import applicationApi from '@/api/application'
import CreateApplicationDialog from './component/CreateApplicationDialog.vue'
import CopyApplicationDialog from './component/CopyApplicationDialog.vue'
import { MsgSuccess, MsgConfirm, MsgAlert, MsgError } from '@/utils/message'
import { isAppIcon } from '@/utils/application'
import { useRouter } from 'vue-router'
import { isWorkFlow } from '@/utils/application'
import { ValidType, ValidCount } from '@/enums/common'
import { t } from '@/locales'
import useStore from '@/stores'

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

function  triggerUpload() {
  if (elUploadRef.value) {
    console.log(elUploadRef.value); // 检查是否有 handleClick 方法
    if (elUploadRef.value.handleClick) {
      elUploadRef.value.handleClick(); // 调用内置方法
    } else {
      // 备用方案：手动触发 input 点击
      const input = elUploadRef.value.$el.querySelector('input[type="file"]');
      if (input) input.click();
    }
  }
}

onMounted(() => {
  getUserList()
})
</script>
<style lang="scss" scoped>
.application-card-add {
  width: 100%;
  font-size: 14px;
  min-height: var(--card-min-height);
  border: 1px dashed var(--el-border-color);
  background: var(--el-disabled-bg-color);
  border-radius: 8px;
  box-sizing: border-box;

  &:hover {
    border: 1px solid var(--el-card-bg-color);
    background-color: var(--el-card-bg-color);
  }

  .card-add-button {
    &:hover {
      border-radius: 4px;
      background: var(--app-text-color-light-1);
    }

    :deep(.el-upload) {
      display: block;
      width: 100%;
      color: var(--el-text-color-regular);
    }
  }
}

.application-card {
  border: none !important; /* 移除所有边框 */
  outline: none !important; /* 禁用焦点轮廓 */
  .status-tag {
    position: absolute;
    right: 16px;
    top: 15px;
  }
}
.application-card:hover,
.application-card:focus,
.aapplication-card:active {
  outline: none !important;
  box-shadow: none !important; /* 禁用可能的阴影效果 */
}

.dropdown-custom-switch {
  padding: 5px 11px;
  font-size: 14px;
  font-weight: 400;

  span {
    margin-right: 26px;
  }
}
/* 基础卡片样式 */
.application-card {
  position: relative;
  overflow: hidden; /* 防止背景溢出 */
  transition: all 0.3s ease;
}

/* 工作流卡片（黄色背景） */
.workflow-card {
  background: url('@/assets/homeicons/appliction-gj.png') no-repeat right bottom;
  background-size: 400px,150px;
  background-position: 10% 10%; /* 自定义位置（右下方偏上） */
  min-height: 130px; /* 确保卡片足够高，避免图片被裁剪 */
  min-width: 400px; /* 确保卡片足够高，避免图片被裁剪 */
  padding: 20px; /* 防止内容覆盖图片 */
}

/* 简单卡片（蓝色背景） */
.simple-card {
  background:
    url('@/assets/homeicons/appliction-pt.png') no-repeat right bottom;
  background-size: 400px,150px;
  background-position: 10% 10%; /* 自定义位置（右下方偏上） */
  min-height: 130px; /* 确保卡片足够高，避免图片被裁剪 */
  min-width: 400px; /* 确保卡片足够高，避免图片被裁剪 */
  padding: 20px; /* 防止内容覆盖图片 */
  //background-size: contain;
}

/*.workflow-card,
.simple-card {
  position: relative; !* 确保背景定位基于元素本身 *!
  overflow: hidden; !* 防止放大时图片溢出 *!
  transition: background-size 0.3s ease; !* 平滑过渡效果 *!
}

!* 悬停时放大背景图片（保持右下角定位） *!
.workflow-card:hover,
.simple-card:hover {
  background-size: 100%; !* 轻微放大（可根据需求调整） *!
}*/

/* 确保内容可读性 */
/*.workflow-card .card-title,
.workflow-card .card-description,
.simple-card .card-title,
.simple-card .card-description {
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}*/
/* 动态背景图片结束 */



.application-list-container{
  height: 95%;
}
.app_img{
  width: 100%;
  height: 35%;
  position: relative; /* 添加相对定位 */
  background-image:
       url('@/assets/homeicons/welcomeapp.png'),
       url('@/assets/homeicons/importapp.png'),
       url('@/assets/homeicons/createapp.png');
  background-position:
        right 10% top 60%, /* 图2右上角偏移 */
        right 98% top 90%, /* 图2右上角偏移 */
        right 98% top 20%; /* 图1居中 */
  background-size:
       80% 82%,  /* 图2宽度100px */
       15% 35%,  /* 图2宽度100px */
       15% 35%;
  background-repeat: no-repeat
}
.clickable-area.import {
 // background-color : red;
  position: absolute; /* 改为绝对定位 */
  //right: 20%;
 // top: 100%;
  width: 15%;
  height: 11%;
  transform: translate(8%, -120%);
}

.clickable-area.create {
 // background-color : red;
  position: absolute; /* 改为绝对定位 */
 // right: 10%;
 // top: 10%;
  width: 15%;
  height: 11%;
  transform: translate(8%, -260%);
}


</style>

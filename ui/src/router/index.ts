import { hasPermission } from '@/utils/permission/index'
import NProgress from 'nprogress'
import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  type RouteRecordName
} from 'vue-router'
import useStore from '@/stores'
import { routes } from '@/router/routes'
NProgress.configure({ showSpinner: false, speed: 500, minimum: 0.3 })
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

// 路由前置拦截器
router.beforeEach(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    NProgress.start()
    if (to.name === '404') {
      next()
      return
    }
    const { user } = useStore()
    const notAuthRouteNameList = ['register', 'login', 'forgot_password', 'reset_password', 'Chat','customerLogin','forgot_password_customer']

    if (!notAuthRouteNameList.includes(to.name ? to.name.toString() : '')) {
      if (to.query && to.query.token) {
        localStorage.setItem('token', to.query.token.toString())
      }
      const token = user.getToken()
        console.log(token)
        console.log(to.name)
      if (!token) {
        if(to.name === 'customerHome'){
             next({
               path: '/customerLogin'
            })
        }else{
            next({
               path: '/login'
            })
        }
        return
      }
      if (!user.userInfo) {
        await user.profile()
      }
    }
    // 判断是否有菜单权限
    if (to.meta.permission ? hasPermission(to.meta.permission as any, 'OR') : true) {
      next()
    } else {
      // 如果没有权限则直接取404页面
      next('404')
    }
  }
)
router.afterEach(() => {
  NProgress.done()
})

export const getChildRouteListByPathAndName = (path: any, name?: RouteRecordName | any) => {
  debugger
  return getChildRouteList(routes, path, name)
}

export const getChildRouteList: (
  routeList: Array<RouteRecordRaw>,
  path: string,
  name?: RouteRecordName | null | undefined
) => Array<RouteRecordRaw> = (routeList, path, name) => {
  for (let index = 0; index < routeList.length; index++) {
    const route = routeList[index]
    if (name === route.name && path === route.path) {
      return route.children || []
    }
    if (route.children && route.children.length > 0) {
      const result = getChildRouteList(route.children, path, name)
      if (result && result?.length > 0) {
        return result
      }
    }
  }
  return []
}

export default router

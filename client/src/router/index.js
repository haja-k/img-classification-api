import { createRouter, createWebHistory } from 'vue-router'

// Routes
import paths from './paths'
console.log(paths.paths)
function route(path, view, name, meta) {
  return {
    name: name || view,
    path,
    component: () => import(`@/views/${view}.vue`),
    meta,
  }
}

// Create a new router
const router = createRouter({
  history: createWebHistory(),
  routes: paths.map((path) =>
    route(path.path, path.view, path.name, path.meta)
  ).concat([{ path: '/:pathMatch(.*)*', redirect: '/' }]),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash }
    }
    return { top: 0, left: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    localStorage.getItem('token') == null
  ) {
    next({ path: '/', params: { nextUrl: to.fullPath } })
  } else if (to.path === '/' && localStorage.getItem('token') != null) {
    next({ path: '/stat-entry' })
  } else {
    next()
  }
})

export default router

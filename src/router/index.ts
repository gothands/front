import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Staking from '../views/Staking.vue'
import Rankings from '../views/Rankings.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/profile/:id',
    name: 'profile',
    component: Profile
  },
  {
    path: '/staking',
    name: 'staking',
    component: Staking
  },
  {
    path: '/rankings',
    name: 'rankings',
    component: Rankings
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

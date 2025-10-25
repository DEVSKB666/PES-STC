
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './store/auth'

import Login from './views/Auth/Login.vue'
import Register from './views/Auth/Register.vue'
import Reset from './views/Auth/Reset.vue'

import Dashboard from './views/Dashboard.vue'

import HR_Topics from './views/HR/Topics.vue'
import HR_Indicators from './views/HR/Indicators.vue'
import HR_Cycles from './views/HR/Cycles.vue'
import HR_Assignments from './views/HR/Assignments.vue'
import HR_Reports from './views/HR/Reports.vue'

import Cmte_Queue from './views/Committee/Queue.vue'
import Cmte_Review from './views/Committee/Review.vue'

import Eva_Submit from './views/Evaluated/Submit.vue'
import Eva_Tracking from './views/Evaluated/Tracking.vue'
import Eva_Report from './views/Evaluated/Report.vue'

const routes = [
  { path: '/login', component: Login, meta:{ public:true } },
  { path: '/register', component: Register, meta:{ public:true } },
  { path: '/reset', component: Reset, meta:{ public:true } },
  { path: '/', component: Dashboard },

  // HR only
  { path: '/hr/topics', component: HR_Topics, meta:{ roles:['ฝ่ายบริหารบุคลากร'] } },
  { path: '/hr/indicators', component: HR_Indicators, meta:{ roles:['ฝ่ายบริหารบุคลากร'] } },
  { path: '/hr/cycles', component: HR_Cycles, meta:{ roles:['ฝ่ายบริหารบุคลากร'] } },
  { path: '/hr/assignments', component: HR_Assignments, meta:{ roles:['ฝ่ายบริหารบุคลากร'] } },
  { path: '/hr/reports', component: HR_Reports, meta:{ roles:['ฝ่ายบริหารบุคลากร'] } },

  // Committee
  { path: '/committee/queue', component: Cmte_Queue, meta:{ roles:['คณะกรรมการประเมิน'] } },
  { path: '/committee/review', component: Cmte_Review, meta:{ roles:['คณะกรรมการประเมิน'] } },

  // Evaluated
  { path: '/evaluated/submit', component: Eva_Submit, meta:{ roles:['ผู้รับการประเมิน'] } },
  { path: '/evaluated/report', component: Eva_Report, meta:{ roles:['ผู้รับการประเมิน'] } },
  { path: '/evaluated/tracking', component: Eva_Tracking }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next)=>{
  const auth = useAuthStore()
  if(to.meta.public) return next()
  if(!auth.token) return next('/login')
  if(to.meta.roles && !to.meta.roles.includes(auth.role)) return next('/')
  next()
})

export default router

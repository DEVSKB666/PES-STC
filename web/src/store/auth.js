
import { defineStore } from 'pinia'

// Role constants
const HR_ROLE = 'ฝ่ายบริหารบุคลากร'
const COMMITTEE_ROLE = 'คณะกรรมการประเมิน'
const EVALUATED_ROLE = 'ผู้รับการประเมิน'

// API helper
const api = async (url, method = 'GET', data = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  
  if (data) options.body = JSON.stringify(data)
  
  const response = await fetch(url, options)
  const json = await response.json().catch(() => null)
  
  if (!response.ok) throw new Error(json?.message || `${method} request failed`)
  return json
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    name: localStorage.getItem('name') || '',
    role: localStorage.getItem('role') || '',
    email: localStorage.getItem('email') || ''
  }),
  
  getters: {
    isHR: (state) => state.role === HR_ROLE,
    isCommittee: (state) => state.role === COMMITTEE_ROLE,
    isEvaluated: (state) => state.role === EVALUATED_ROLE,
    isLoggedIn: (state) => !!state.token,
    authHeaderObj: (state) => state.token ? { Authorization: `Bearer ${state.token}` } : {}
  },
  
  actions: {
    // Expose as a function to match component calls
    authHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    },
    setUser(user) {
      const { name, role, email } = user
      this.name = name
      this.role = role
      this.email = email
      
      localStorage.setItem('name', name)
      localStorage.setItem('role', role)
      localStorage.setItem('email', email)
    },
    
    async login(email, password) {
      const result = await api('/api/auth/login', 'POST', { email, password })
      this.token = result.data.token
      localStorage.setItem('token', this.token)
      this.setUser(result.data.user)
      return true
    },
    
    async register(payload) {
      await api('/api/auth/register', 'POST', payload)
      return true
    },
    
    async reset(email, new_password) {
      await api('/api/auth/reset', 'POST', { email, new_password })
      return true
    },
    
    logout() {
      this.token = ''
      this.name = ''
      this.role = ''
      this.email = ''
      localStorage.clear()
      location.href = '/login'
    }
  }
})

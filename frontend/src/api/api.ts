import axios from 'axios'

import { BACKEND_URL } from '../config/env'
import { authStore } from '../store/authStore'
import { refreshToken } from './auth.service'

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
})

const forceLogout = () => {
  window.location.href = '/login'
}

api.interceptors.request.use((config) => {
  const token = authStore.token
  if (authStore) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (originalRequest.url.includes('/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await refreshToken()
        return api(originalRequest)
      } catch {
        forceLogout()
        return Promise.reject(error)
      }
    }
  }
)

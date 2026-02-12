import { AxiosError } from 'axios'

import { LoginData } from '../pages/auth/Login'
import { setAuthStore } from '../store/authStore'
import { getDeviceId } from '../utils/deviceId'
import { api } from './api'

export const loginUser = async (loginData: LoginData) => {
  try {
    const response = await api.post('/auth/login', loginData)
    return { success: true, data: response.data }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.status === 400) return { success: false, errorType: 'CREDENTIALS' }
      return { success: false, errorType: 'SERVER' }
    } else {
      return { success: false, errorType: 'SERVER' }
    }
  }
}

export const registerUser = async (loginData: LoginData) => {
  try {
    const response = await api.post('/auth/register', loginData)
    return { success: true, data: response.data }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.status === 400) return { success: false, errorType: 'USERNAME_EXIST' }
      return { success: false, errorType: 'SERVER' }
    } else {
      return { success: false, errorType: 'SERVER' }
    }
  }
}

export const refreshToken = async () => {
  try {
    const deviceId = getDeviceId()
    const response = await api.post('/auth/refresh', { deviceId })

    setAuthStore('token', response.data.token)
    setAuthStore('userId', response.data.userId)
    setAuthStore('role', response.data.role)

    return { success: true }
  } catch (error) {
    setAuthStore('token', '')
    setAuthStore('userId', null)
    setAuthStore('role', '')

    throw error
  }
}

export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/protected')
    return { success: true, data: response.data }
  } catch {
    return { success: false, errorType: 'AUTHORIZATION' }
  }
}

export const logout = async () => {
  try {
    const deviceId = getDeviceId()
    const response = await api.post('/auth/logout', { deviceId })
    return { success: true, data: response.data }
  } catch {
    return { success: false, errorType: 'Server error' }
  } finally {
    setAuthStore({ token: '', userId: null, role: '' })
  }
}

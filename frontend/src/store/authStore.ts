import { createStore } from 'solid-js/store'

export const [authStore, setAuthStore] = createStore({
  token: '',
  userId: null,
  role: '',
})

import { Route, Router } from '@solidjs/router'
import { type Component, createSignal, onMount, Show } from 'solid-js'

import { refreshToken } from './api/auth.service'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/Home'
import MainLayout from './pages/MainLayout'
import TripDetail from './pages/trips/TripDetail'
import Trips from './pages/trips/Trips'
import { authStore } from './store/authStore'

const App: Component = () => {
  const [isLoading, setIsLoading] = createSignal(true)

  onMount(async () => {
    try {
      await refreshToken()
    } finally {
      setIsLoading(false)
    }
  })

  const LoadingScreen = () => (
    <div class="flex h-screen w-full items-center justify-center bg-base-200">
      <span class="loading loading-spinner text-primary loading-lg"></span>
    </div>
  )

  const privateRoutes = (
    <>
      <Route component={PrivateRoute}>
        <Route path="/trips" component={Trips} />
        <Route path="/trips/:id" component={TripDetail} />
      </Route>
    </>
  )

  const publicRoutes = (
    <>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </>
  )

  return (
    <Show when={!isLoading()} fallback={<LoadingScreen />}>
      <Router root={MainLayout}>
        <Route path="/" component={Home} />
        <Show when={!authStore.userId}>{publicRoutes}</Show>
        <Show when={authStore.role === 'USER'}>{privateRoutes}</Show>
      </Router>
    </Show>
  )
}

export default App
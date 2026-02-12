import { useNavigate } from '@solidjs/router'
import { onMount, ParentComponent, Show } from 'solid-js'

import { verifyToken } from '../api/auth.service'
import { authStore } from '../store/authStore'

const PrivateRoute: ParentComponent = (props) => {
  const navigate = useNavigate()

  onMount(async () => {
    if (!authStore.token) {
      navigate('/login', { replace: true })
    }
    try {
      const result = await verifyToken()
      if (!result.success) navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  })

  return (
    <Show
      when={authStore.token}
      fallback={
        <div class="flex h-screen w-full items-center justify-center">Verificando sesión...</div>
      }
    >
      {props.children}
    </Show>
  )
}

export default PrivateRoute

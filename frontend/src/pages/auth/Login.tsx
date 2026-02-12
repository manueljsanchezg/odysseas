import { A, useNavigate } from '@solidjs/router'
import { Component, createSignal, Show } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import * as v from 'valibot'

import { loginUser } from '../../api/auth.service'
import { setAuthStore } from '../../store/authStore'
import { getDeviceId } from '../../utils/deviceId'

const LoginSchema = v.object({
  username: v.pipe(v.string(), v.nonEmpty('You must enter the username')),
  password: v.pipe(v.string(), v.nonEmpty('You must enter the password')),
})

export interface LoginData {
  username: string
  password: string
  deviceId?: string
}

const Login: Component = () => {
  const navigate = useNavigate()

  const [loginData, setLoginData] = createStore<LoginData>({
    username: '',
    password: '',
    deviceId: '',
  })

  const [loginErrors, setLoginErrors] = createStore<LoginData>({
    username: '',
    password: '',
  })

  const [serverError, setServerError] = createSignal<string>('')
  const [loading, setLoading] = createSignal(false)

  const handleLogin = async (e: Event) => {
    e.preventDefault()
    setLoginData('deviceId', getDeviceId())
    setLoginErrors({ username: '', password: '' })
    setServerError('')
    
    const data = unwrap(loginData)
    const parse = v.safeParse(LoginSchema, data)

    if (parse.success) {
      setLoading(true)
      const result = await loginUser(data)
      setLoading(false)

      if (result.success) {
        setAuthStore('token', result.data.token)
        setAuthStore('userId', result.data.userId)
        setAuthStore('role', result.data.role)
        navigate('/')
      } else {
        if (result.errorType === 'SERVER') setServerError('Server error')
        if (result.errorType === 'CREDENTIALS') setServerError('Invalid credentials')
      }
    } else {
      if (parse.issues.length > 0) {
        parse.issues.map((i) => setLoginErrors(i.path?.[0].key as keyof LoginData, i.message))
      }
    }
  }

  return (
    <div class="flex justify-center w-full mt-10 px-4">
      <div class="card w-full max-w-lg bg-base-100 shadow-xl">
        <form onSubmit={handleLogin} class="card-body gap-4">
          
          <div class="text-center mb-4">
            <h1 class="card-title text-4xl justify-center font-extrabold text-base-content">Welcome back</h1>
            <p class="text-base-content/60">Please enter your details</p>
          </div>

          <div class="form-control w-full">
            <label class="label" for="username">
              <span class="label-text font-bold text-lg">Username</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="Ej. Jhon"
              value={loginData.username}
              onInput={(e) => setLoginData('username', e.target.value)}
              class={`input input-bordered w-full ${loginErrors.username ? 'input-error' : ''}`}
            />
            <Show when={loginErrors.username}>
              <div class="label">
                <span class="label-text-alt text-error">{loginErrors.username}</span>
              </div>
            </Show>
          </div>

          <div class="form-control w-full">
            <label class="label" for="password">
              <span class="label-text font-bold text-lg">Password</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onInput={(e) => setLoginData('password', e.target.value)}
              class={`input input-bordered w-full ${loginErrors.password ? 'input-error' : ''}`}
            />
            <Show when={loginErrors.password}>
              <div class="label">
                <span class="label-text-alt text-error">{loginErrors.password}</span>
              </div>
            </Show>
          </div>

          <Show when={serverError()}>
            <div role="alert" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{serverError()}</span>
            </div>
          </Show>

          <div class="form-control mt-2">
            <A href="/register" class="link link-hover text-sm text-center mb-4">
              Not registered yet? Create an account
            </A>
      
          </div>
          <button
              type="submit"
              class="btn btn-primary text-lg"
              disabled={loading()}
            >
              <Show when={loading()} fallback="Login">
                <span class="loading loading-spinner"></span>
                Logging in...
              </Show>
            </button>
        </form>
      </div>
    </div>
  )
}

export default Login
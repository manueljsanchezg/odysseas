import { useNavigate } from '@solidjs/router'
import { Component, createSignal, Show } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import * as v from 'valibot'

import { registerUser } from '../../api/auth.service'

const RegisterSchema = v.object({
  username: v.pipe(
    v.string(),
    v.nonEmpty('You must enter the username'),
    v.minLength(4, 'You must enter 4 characters at least')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('You must enter the password'),
    v.minLength(4, 'You must enter 4 characters at least')
  ),
})

interface RegisterData {
  username: string
  password: string
}

const Register: Component = () => {
  const navigate = useNavigate()
  const [registerData, setRegisterData] = createStore<RegisterData>({ username: '', password: '' })
  const [registerErrors, setRegisterErrors] = createStore<RegisterData>({ username: '', password: '' })
  const [serverError, setServerError] = createSignal<string>('')
  const [loading, setLoading] = createSignal(false)

  const handleRegister = async (e: Event) => {
    e.preventDefault()
    setRegisterErrors({ username: '', password: '' })
    const data = unwrap(registerData)
    const parse = v.safeParse(RegisterSchema, data)

    if (parse.success) {
      setLoading(true)
      const result = await registerUser(data)
      setLoading(false)
      if (result.success) {
        navigate('/login')
      } else {
        if (result.errorType === 'SERVER') setServerError('Server error')
        if (result.errorType === 'USERNAME_EXISTS') setRegisterErrors('username', 'This username already exists')
      }
    } else {
      if (parse.issues.length > 0) {
        parse.issues.map((i) => setRegisterErrors(i.path?.[0].key as keyof RegisterData, i.message))
      }
    }
  }

  return (
    <div class="flex justify-center w-full mt-10 px-4">
      <div class="card w-full max-w-lg bg-base-100 shadow-xl">
        <form onSubmit={handleRegister} class="card-body gap-4">
          
          <div class="text-center mb-4">
            <h1 class="card-title text-4xl justify-center font-extrabold text-base-content">Join us</h1>
            <p class="text-base-content/60">Create an account to get started</p>
          </div>

          <div class="form-control w-full">
            <label class="label" for="username">
              <span class="label-text font-bold text-lg">Username</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="Ej. Jhon"
              value={registerData.username}
              onInput={(e) => setRegisterData('username', e.target.value)}
              class={`input input-bordered w-full ${registerErrors.username ? 'input-error' : ''}`}
            />
            <Show when={registerErrors.username}>
              <div class="label"><span class="label-text-alt text-error">{registerErrors.username}</span></div>
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
              value={registerData.password}
              onInput={(e) => setRegisterData('password', e.target.value)}
              class={`input input-bordered w-full ${registerErrors.password ? 'input-error' : ''}`}
            />
            <Show when={registerErrors.password}>
              <div class="label"><span class="label-text-alt text-error">{registerErrors.password}</span></div>
            </Show>
          </div>

          <Show when={serverError()}>
             <div role="alert" class="alert alert-error">
              <span>{serverError()}</span>
            </div>
          </Show>

          <div class="form-control mt-4">
            <button type="submit" class="btn btn-primary text-lg" disabled={loading()}>
              <Show when={loading()} fallback="Register">
                <span class="loading loading-spinner"></span> Creating account...
              </Show>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
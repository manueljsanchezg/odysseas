import { minLength, object, pipe, string } from 'valibot'

const registerUserSchema = object({
  username: string(),
  password: pipe(string(), minLength(4)),
})

const loginUserSchema = object({
  username: string(),
  password: pipe(string(), minLength(4)),
  deviceId: string(),
})

const refreshSchema = object({
  deviceId: string(),
})

export default { loginUserSchema, registerUserSchema, refreshSchema }

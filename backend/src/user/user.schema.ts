import { minLength, object, pipe, string } from 'valibot'

const createUserBody = object({
  username: string(),
  password: pipe(string(), minLength(4)),
})

export default { createUserBody }

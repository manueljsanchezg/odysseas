import { eq } from 'drizzle-orm'

import db from '../infra/db'
import { Role, usersTable } from '../infra/schema'

async function createUser(username: string, password: string, role?: Role) {
  const hashedPassword = await Bun.password.hash(password)
  return await db.insert(usersTable).values({ username, password: hashedPassword, role })
}

async function findAllUsers() {
  return await db
    .select({ id: usersTable.id, username: usersTable.username, role: usersTable.role })
    .from(usersTable)
}

async function findUserById(userId: number) {
  const user = await db
    .select({ id: usersTable.id, username: usersTable.username, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1)
  return user[0]
}

async function findUserByUsername(username: string) {
  const user = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      password: usersTable.password,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1)
  return user[0]
}

async function deleteByUserId(userId: number) {
  return await db.delete(usersTable).where(eq(usersTable.id, userId))
}

export default { createUser, findAllUsers, findUserById, findUserByUsername, deleteByUserId }

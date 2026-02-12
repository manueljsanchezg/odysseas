import { and, eq } from 'drizzle-orm'

import db from '../infra/db'
import { refreshTokensTable } from '../infra/schema'

async function createRefreshToken(
  token: string,
  deviceId: string,
  expiresAt: Date,
  userId: number
) {
  const hashedToken = await Bun.password.hash(token)
  return await db
    .insert(refreshTokensTable)
    .values({ token: hashedToken, deviceId, expiresAt, userId })
}

async function updateRefreshToken(
  token: string,
  deviceId: string,
  expiresAt: Date,
  userId: number
) {
  const hashedToken = await Bun.password.hash(token)
  return await db
    .update(refreshTokensTable)
    .set({ token: hashedToken, expiresAt })
    .where(and(eq(refreshTokensTable.userId, userId), eq(refreshTokensTable.deviceId, deviceId)))
}

async function createOrUpdateRefreshToken(
  token: string,
  deviceId: string,
  expiresAt: Date,
  userId: number
) {
  const hashedToken = await Bun.password.hash(token)
  return await db
    .insert(refreshTokensTable)
    .values({ token: hashedToken, deviceId, expiresAt, userId })
    .onConflictDoUpdate({
      target: [refreshTokensTable.userId, refreshTokensTable.deviceId],
      set: { token: hashedToken, deviceId, expiresAt, userId },
    })
}

async function findRefreshTokenByUserIdAndDeviceId(userId: number, deviceId: string) {
  const res = await db
    .select()
    .from(refreshTokensTable)
    .where(and(eq(refreshTokensTable.userId, userId), eq(refreshTokensTable.deviceId, deviceId)))

  return res[0]
}

async function deleteRefreshTokenByUserIdAndDeviceId(userId: number, deviceId: string) {
  return await db
    .delete(refreshTokensTable)
    .where(and(eq(refreshTokensTable.userId, userId), eq(refreshTokensTable.deviceId, deviceId)))
}

export default {
  createRefreshToken,
  updateRefreshToken,
  createOrUpdateRefreshToken,
  findRefreshTokenByUserIdAndDeviceId,
  deleteRefreshTokenByUserIdAndDeviceId,
}

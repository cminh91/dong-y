import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function auth(): Promise<{ user: User } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return null
    }

    return { user }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}

// Verify token from NextRequest
export async function verifyTokenFromRequest(request: Request): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value || cookieStore.get('authToken')?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch {
    return null
  }
}

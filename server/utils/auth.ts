import { H3Event } from 'h3'
import crypto from 'crypto'

export interface AuthUser {
    id: string
    email: string
    role: 'ADMIN' | 'PROFESSOR' | 'EMPRESA'
    professorId?: string
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'a-fallback-safe-secret-key-32-chars-long!!'

export const signToken = (data: string): string => {
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7 // 1 semana
    const message = `${data}.${expiresAt}`
    const signature = crypto.createHmac('sha256', SESSION_SECRET).update(message).digest('hex')
    return `${message}.${signature}`
}

export const verifyToken = (token: string): string | null => {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const [data, expiresAtStr, signature] = parts
        if (!data || !expiresAtStr || !signature) return null
        
        const expiresAt = parseInt(expiresAtStr, 10)
        if (isNaN(expiresAt) || expiresAt < Date.now()) return null

        const message = `${data}.${expiresAtStr}`
        const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(message).digest('hex')
        
        const sigBuffer = Buffer.from(signature, 'hex')
        const expectedBuffer = Buffer.from(expectedSignature, 'hex')
        if (sigBuffer.length !== expectedBuffer.length) return null

        if (crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
            return data
        }
        return null
    } catch {
        return null
    }
}

export const getAuthUser = async (event: H3Event): Promise<AuthUser | null> => {
    const token = getCookie(event, 'auth_token')
    
    if (!token) return null

    const userId = verifyToken(token)
    if (!userId) return null

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            professor: {
                select: { id: true }
            }
        }
    })

    if (!user) return null

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        professorId: user.professor?.id
    }
}

export const requireAdmin = async (event: H3Event) => {
    const user = await getAuthUser(event)
    if (!user || user.role !== 'ADMIN') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Acesso restrito a administradores'
        })
    }
    return user
}

export const requireAuth = async (event: H3Event) => {
    const user = await getAuthUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Não autenticado'
        })
    }
    return user
}

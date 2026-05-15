import { H3Event } from 'h3'

export interface AuthUser {
    id: string
    email: string
    role: 'ADMIN' | 'PROFESSOR' | 'EMPRESA'
    professorId?: string
}

export const getAuthUser = async (event: H3Event): Promise<AuthUser | null> => {
    const userId = getCookie(event, 'auth_token')
    
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

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
    }

    const userId = verifyToken(token)
    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Sessão inválida ou expirada' })
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
    })

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Usuário não encontrado' })
    }

    return user
})
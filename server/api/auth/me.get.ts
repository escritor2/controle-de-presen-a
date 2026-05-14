export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
    }

    const user = await prisma.user.findUnique({
        where: { id: token },
        select: { id: true, email: true, role: true }
    })

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Usuário não encontrado' })
    }

    return user
})
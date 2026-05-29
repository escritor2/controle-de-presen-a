export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, senha } = body

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user || !(await comparePassword(senha, user.senha))) {
        throw createError({
            statusCode: 401,
            statusMessage: "E-mail ou senha incorretos."
        })
    }

    const token = signToken(user.id)

    setCookie(event, 'auth_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: '/'
    })

    return {
        id: user.id,
        email: user.email,
        role: user.role
    }
})
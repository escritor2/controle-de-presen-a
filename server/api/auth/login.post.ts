import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) =>{
    const {email, senha} = await readBody(event)

    const user = await prisma.user.findUnique({
        where: {email}
    })
 
    if(!user || !(await bcrypt.compare(senha, user.senha))){
        throw createError({
            statusCode: 401,
            statusMessage: "Credenciais invalidas"

        })
    }

    setCookie(event, 'auth_token', JSON.stringify({id:user.id, role: user.role}), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    return {message: 'sucesso', role: user.role}


})
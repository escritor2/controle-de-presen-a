export default defineEventHandler(async (event) =>{
    const token = getCookie(event, 'auth_token')

    if(!token) return {user : null}

    const id = token

    const user = await prisma.user.findUnique({
        where: {id},
        select: {id: true, email: true, role: true}
    })

    return { user }

})
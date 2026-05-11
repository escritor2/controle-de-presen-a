export default defineEventHandler(async (event)=>{
    const users = await prisma.user.findMany({
        select:{
            id: true,
            email: true,
            role: true,
            createdAt: true
        }
    })
    return {
        quantidade_usuarios: users.length,
        usuarios: users
    };
})
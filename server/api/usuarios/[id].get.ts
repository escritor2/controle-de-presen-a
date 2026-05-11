export default defineEventHandler(async(event)=>{
    const id = getRouterParam(event, 'id')
    const user = await prisma.user.findUnique({
        where: {id: id}
    })

    return {user}

})
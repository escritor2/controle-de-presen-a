export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    return await prisma.professor.findMany({
        orderBy: {
            nome: 'asc'
        }
    })
})

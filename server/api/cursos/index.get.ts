export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    return await prisma.curso.findMany({
        orderBy: { nome: 'asc' }
    })
})

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    return await prisma.turma.findMany({
        include: {
            curso: true,
            disciplinas: {
                include: {
                    professor: true
                }
            }
        }
    })
})

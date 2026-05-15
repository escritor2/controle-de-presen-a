export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    return await prisma.turma.findMany({
        include: {
            curso: true,
            _count: {
                select: { alunos: true }
            },
            disciplinas: {
                include: {
                    professor: true
                }
            }
        }
    })
})

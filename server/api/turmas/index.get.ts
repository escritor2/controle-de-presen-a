export default defineEventHandler(async (event) => {
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

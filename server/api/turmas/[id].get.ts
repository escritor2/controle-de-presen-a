export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    return await prisma.turma.findUnique({
        where: { id },
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

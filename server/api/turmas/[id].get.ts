export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    const user = await requireAuth(event)
    
    const turma = await prisma.turma.findUnique({
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

    if (!turma) {
        throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada' })
    }

    // Segurança: Admin ou Professor da turma
    const isProfessorDaTurma = turma.disciplinas.some(d => d.professorId === user.professorId)
    if (user.role !== 'ADMIN' && !isProfessorDaTurma) {
        throw createError({ statusCode: 403, statusMessage: 'Não autorizado' })
    }

    return turma
})

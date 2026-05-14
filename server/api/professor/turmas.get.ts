export default defineEventHandler(async (event) => {
    const userId = getCookie(event, 'auth_token') // Simplificado, idealmente viria de um session validado

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
    }

    const professor = await prisma.professor.findUnique({
        where: { userId },
        include: {
            disciplinas: {
                include: {
                    turma: {
                        include: {
                            curso: true
                        }
                    }
                }
            }
        }
    })

    if (!professor) {
        return []
    }

    // Mapear para retornar apenas as turmas únicas
    const turmasMap = new Map()
    professor.disciplinas.forEach(d => {
        if (!turmasMap.has(d.turma.id)) {
            turmasMap.set(d.turma.id, d.turma)
        }
    })

    return Array.from(turmasMap.values())
})

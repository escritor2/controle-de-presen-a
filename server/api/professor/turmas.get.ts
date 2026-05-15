export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const userId = user.id

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

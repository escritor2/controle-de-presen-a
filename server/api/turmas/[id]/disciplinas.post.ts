import { z } from 'zod'

const disciplinaSchema = z.object({
    nome: z.string().min(3),
    professorId: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const turmaId = getRouterParam(event, 'id')
    const body = await readBody(event)

    const result = disciplinaSchema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, data: result.error.format() })
    }

    if (!turmaId) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    return await prisma.disciplina.create({
        data: {
            nome: result.data.nome,
            turmaId,
            professorId: result.data.professorId
        },
        include: {
            professor: true
        }
    })
})

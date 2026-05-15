export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    return await prisma.turma.update({
        where: { id },
        data: {
            spreadsheetId: body.spreadsheetId
        } as any
    })
})

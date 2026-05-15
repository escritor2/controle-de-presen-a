export default defineEventHandler(async (event) => {
    const currentUser = await requireAdmin(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do usuário não fornecido'
        })
    }

    if (currentUser.id === id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Você não pode excluir sua própria conta administrador'
        })
    }

    try {

        await prisma.user.delete({
            where: { id }
        })

        return { message: 'Usuário removido com sucesso' }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao remover usuário'
        })
    }
})

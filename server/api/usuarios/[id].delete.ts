export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do usuário não fornecido'
        })
    }

    try {
        // Primeiro deletamos as relações se necessário
        // Nota: No schema atual, User tem professor (1:1) e empresa (N:1)
        // prisma handles cascading if configured, but let's be safe
        
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

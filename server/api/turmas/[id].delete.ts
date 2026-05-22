export default defineEventHandler(async (event) =>{
    const id = getRouterParam(event, 'id');

    if(!id){
        throw createError({
            statusCode: 400, statusMessage: 'ID da turma não fornecido'
        })
    }

    try {
        await prisma.turma.delete(
            {where: {id}}
        )
        return { message: "Turma removida com sucesso"}
    }
    catch(e: any){
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao remover turma'
        })
    }
})
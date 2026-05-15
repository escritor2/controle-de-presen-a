export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do aluno não fornecido' });
  }

  try {
    return await prisma.aluno.delete({
      where: { id }
    });
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir aluno: ' + error.message });
  }
});

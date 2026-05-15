export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do curso não fornecido' });
  }

  try {
    return await prisma.curso.delete({
      where: { id }
    });
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir curso: ' + error.message });
  }
});

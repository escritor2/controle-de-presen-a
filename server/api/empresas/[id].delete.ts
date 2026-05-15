export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID da empresa não fornecido' });
  }

  try {
    return await prisma.empresa.delete({
      where: { id }
    });
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir empresa: ' + error.message });
  }
});

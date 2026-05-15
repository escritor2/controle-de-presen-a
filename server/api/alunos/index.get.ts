export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const search = query.search as string;

  return await prisma.aluno.findMany({
    where: search ? {
      OR: [
        { nome: { contains: search } },
        { matricula: { contains: search } }
      ]
    } : {},
    orderBy: { nome: 'asc' },
    include: {
      empresa: true,
      turmas: {
        include: {
            turma: true
        }
      }
    }
  });
});

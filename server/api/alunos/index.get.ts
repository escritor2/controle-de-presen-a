export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const search = query.search as string;

  return await prisma.aluno.findMany({
    where: search ? {
      OR: [
        { nome: { contains: search, mode: 'insensitive' } },
        { matricula: { contains: search, mode: 'insensitive' } }
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

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return await prisma.empresa.findMany({
    orderBy: { nome: 'asc' },
    include: {
        _count: {
            select: { alunos: true, usuarios: true }
        }
    }
  });
});

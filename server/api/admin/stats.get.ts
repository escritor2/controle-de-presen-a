export default defineEventHandler(async (event) => {
    await requireAdmin(event);

    const [totalAlunos, totalTurmas, totalProfessores, totalEmpresas, totalDisciplinas] = await Promise.all([
        prisma.aluno.count(),
        prisma.turma.count(),
        prisma.professor.count(),
        prisma.empresa.count(),
        prisma.disciplina.count()
    ]);

    // Busca turmas com mais alunos (Top 5)
    const turmasPopulares = await prisma.turma.findMany({
        take: 5,
        include: {
            _count: {
                select: { alunos: true }
            },
            curso: true
        },
        orderBy: {
            alunos: {
                _count: 'desc'
            }
        }
    });

    return {
        totalAlunos,
        totalTurmas,
        totalProfessores,
        totalEmpresas,
        totalDisciplinas,
        turmasPopulares
    };
});

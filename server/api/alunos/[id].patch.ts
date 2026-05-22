import { z } from "zod";

const updateAlunoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  empresaId: z.string().optional().nullable(),
  turmas: z.array(z.object({
    turmaId: z.string(),
    subturma: z.enum(['A', 'B', 'GERAL']).optional().default('GERAL')
  })).optional().default([])
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do aluno não fornecido' });
  }

  const body = await readBody(event);
  const result = updateAlunoSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { nome, matricula, empresaId, turmas } = result.data;

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.alunoNaTurma.deleteMany({
        where: { alunoId: id }
      });

      return await tx.aluno.update({
        where: { id },
        data: {
          nome,
          matricula,
          empresaId: empresaId || null,
          turmas: {
            create: turmas.map(t => ({
              turmaId: t.turmaId,
              subturma: t.subturma as any
            }))
          }
        },
        include: {
          turmas: {
            include: {
              turma: true
            }
          }
        }
      });
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Matrícula já cadastrada' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar aluno: ' + error.message });
  }
});

import { z } from "zod";

const createAlunoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  empresaId: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const result = createAlunoSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { nome, matricula, empresaId } = result.data;

  try {
    return await prisma.aluno.create({
      data: {
        nome,
        matricula,
        empresaId: empresaId || null
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Matrícula já cadastrada' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar aluno: ' + error.message });
  }
});

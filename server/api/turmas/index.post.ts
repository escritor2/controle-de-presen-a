import { z } from "zod";

const createTurmaSchema = z.object({
  nome: z.string().min(3),
  codigo: z.string().min(2),
  periodo: z.string(),
  termo: z.number().int().min(1),
  cursoId: z.string().uuid()
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const result = createTurmaSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  try {
    return await prisma.turma.create({
      data: result.data,
      include: {
        curso: true
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Código de turma já existe' });
    }
    throw error;
  }
});

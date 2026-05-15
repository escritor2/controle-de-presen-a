import { z } from "zod";

const createCursoSchema = z.object({
  nome: z.string().min(3, "Nome do curso deve ter no mínimo 3 caracteres"),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const result = createCursoSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { nome } = result.data;

  try {
    return await prisma.curso.create({
      data: { nome }
    });
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar curso: ' + error.message });
  }
});

import { z } from "zod";

const updateCursoSchema = z.object({
  nome: z.string().min(3, "Nome do curso deve ter no mínimo 3 caracteres"),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do curso não fornecido' });
  }

  const body = await readBody(event);
  const result = updateCursoSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { nome } = result.data;

  try {
    return await prisma.curso.update({
      where: { id },
      data: { nome }
    });
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar curso: ' + error.message });
  }
});

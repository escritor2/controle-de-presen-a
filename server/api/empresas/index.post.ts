import { z } from "zod";

const createEmpresaSchema = z.object({
  nome: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
  cnpj: z.string().optional().or(z.literal('')),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const result = createEmpresaSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { nome, cnpj } = result.data;

  try {
    return await prisma.empresa.create({
      data: { 
        nome, 
        cnpj: cnpj || null 
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'CNPJ já cadastrado' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar empresa: ' + error.message });
  }
});

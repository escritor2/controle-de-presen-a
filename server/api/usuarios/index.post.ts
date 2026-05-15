import { z } from "zod";


const createUserSchema = z.object({
  email: z.email(),
  senha: z.string().min(6),
  role: z.enum(["ADMIN", "EMPRESA", "PROFESSOR"]),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional().or(z.literal('')),
});



export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const result = createUserSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { email, senha, role, nome } = result.data;
  const hashedPassword = await hashPassword(senha);


  const userData: any = {
    email,
    senha: hashedPassword,
    role,
  };

  const finalNome = nome || email.split('@')[0];

  if (role === 'PROFESSOR') {
    userData.professor = {
      create: { nome: finalNome }
    };
  } else if (role === 'EMPRESA') {
    userData.empresa = {
      create: { nome: finalNome }
    };
  }

  try {
    return await prisma.user.create({
      data: userData
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'E-mail já cadastrado' });
    }
    throw error;
  }
});
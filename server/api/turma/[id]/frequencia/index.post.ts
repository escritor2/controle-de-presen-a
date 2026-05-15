import { z } from "zod";

const markPresenceSchema = z.object({
  alunoId: z.string().uuid(),
  data: z.string(), // Formato dd/mm ou ISO
  presente: z.boolean()
});

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, 'id'); // turmaId

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' });

  const body = await readBody(event);
  const result = markPresenceSchema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.format() });
  }

  const { alunoId, data, presente } = result.data;

  // Garantir que a turma existe e buscar a disciplina
  const turma = await prisma.turma.findUnique({
    where: { id },
    include: { disciplinas: true }
  });

  if (!turma) throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada' });

  const disciplinaId = turma.disciplinas[0]?.id;
  if (!disciplinaId) {
    throw createError({ statusCode: 400, statusMessage: 'A turma não tem disciplina atribuída' });
  }

  // Converter data string (dd/mm) para Date object se necessário
  let dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) {
    const partes = data.split('/');
    if (partes.length >= 2) {
      dataObj = new Date();
      dataObj.setDate(parseInt(partes[0] || '1'));
      dataObj.setMonth(parseInt(partes[1] || '1') - 1);
    }
  }

  return await prisma.frequencia.upsert({
    where: {
      alunoId_disciplinaId_data: {
        alunoId,
        disciplinaId,
        data: dataObj
      }
    },
    update: { presente },
    create: {
      alunoId,
      disciplinaId,
      turmaId: id,
      data: dataObj,
      presente
    }
  });
});

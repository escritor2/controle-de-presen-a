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

  const registro = await prisma.frequencia.upsert({
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

  if (turma.spreadsheetId) {
    const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
    const proxyUrl = 'https://script.google.com/macros/s/AKfycbxFxjEhPynecv0vwdUSsfKa1bnJRKt8V8iZT66AClBKh5N5T0uHQIR9TuD99UwKVReo/exec';

    if (aluno && aluno.matricula) {
      const dia = dataObj.getDate().toString().padStart(2, '0');
      const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
      const dataFormatada = `${dia}/${mes}`;
      // Dispara o sync em background (sem travar a resposta da API)
      const config = useRuntimeConfig();
      fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.syncToken,
          spreadsheetId: turma.spreadsheetId,
          matricula: aluno.matricula,
          data: dataFormatada,
          status: presente ? 'P' : 'F'
        })
      }).catch(err => console.error('Erro no sync-back Google Sheets:', err));
    }
  }

  return registro;
});

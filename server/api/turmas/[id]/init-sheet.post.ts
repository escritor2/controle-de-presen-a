export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  const turma = await prisma.turma.findUnique({
    where: { id },
    include: {
      alunos: {
        include: {
          aluno: true
        }
      }
    }
  });

  if (!turma || !turma.spreadsheetId) {
    throw createError({ statusCode: 400, statusMessage: 'Turma não encontrada ou sem planilha vinculada' });
  }

  const students = turma.alunos.map(a => ({
    matricula: a.aluno.matricula,
    nome: a.aluno.nome
  }));

  // Opcional: Gerar as próximas 10 datas (segunda a sexta) para o cabeçalho
  const dates: string[] = [];
  let cursor = new Date();
  while (dates.length < 15) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      const dia = cursor.getDate().toString().padStart(2, '0');
      const mes = (cursor.getMonth() + 1).toString().padStart(2, '0');
      dates.push(`${dia}/${mes}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const proxyUrl = 'https://script.google.com/macros/s/AKfycbxFxjEhPynecv0vwdUSsfKa1bnJRKt8V8iZT66AClBKh5N5T0uHQIR9TuD99UwKVReo/exec';
  const config = useRuntimeConfig();

  try {
    const response = await $fetch(proxyUrl, {
      method: 'POST',
      body: {
        action: 'initialize',
        token: config.syncToken,
        spreadsheetId: turma.spreadsheetId,
        students,
        dates
      }
    });
    return response;
  } catch (err: any) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Erro ao conectar com o Google Sheets: ' + (err.message || '') 
    });
  }
});

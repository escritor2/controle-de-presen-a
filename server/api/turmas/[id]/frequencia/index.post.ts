import { z } from "zod";

const markPresenceSchema = z.object({
    alunoId: z.string().uuid(),
    data: z.string(), // Formato dd/mm ou ISO
    faltas: z.number().min(0).max(5)
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

    const { alunoId, data, faltas } = result.data;

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
            const dia = parseInt(partes[0] || '1');
            const mes = parseInt(partes[1] || '1') - 1;
            dataObj = new Date(new Date().getFullYear(), mes, dia, 12, 0, 0);
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
        update: { faltas },
        create: {
            alunoId,
            disciplinaId,
            turmaId: id,
            data: dataObj,
            faltas
        }
    });

    if (turma.spreadsheetId) {
        const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
        const proxyUrl = process.env.LINK_PROXY as any;


        if (aluno && aluno.matricula) {
            let spreadsheetId = turma.spreadsheetId.trim();
            if (spreadsheetId.includes('docs.google.com')) {
                const matches = spreadsheetId.match(/\/d\/(.*?)(\/|$)/);
                if (matches && matches[1]) {
                    spreadsheetId = matches[1];
                }
            }

            // Sincroniza com o Google Sheets (agora com await para garantir que a requisição não morra)
            const config = useRuntimeConfig();
            try {
                await $fetch(proxyUrl, {
                    method: 'POST',
                    body: {
                        action: 'update',
                        token: config.syncToken,
                        spreadsheetId,
                        matricula: aluno.matricula,
                        data: data, // Usa exatamente a mesma string recebida do front-end (ex: 15/05)
                        status: faltas.toString()
                    }
                });
            } catch (err) {
                console.error('Erro no sync Google Sheets:', err);
            }
        }
    }

    return registro;
});

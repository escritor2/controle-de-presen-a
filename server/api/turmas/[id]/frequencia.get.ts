export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    const user = await requireAuth(event)

    const turma = await prisma.turma.findUnique({
        where: { id },
        include: {
            disciplinas: true
        }
    })

    if (!turma || !(turma as any).spreadsheetId) {
        throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada ou planilha não vinculada' })
    }

    // Admin ou Professor da turma
    const isProfessorDaTurma = turma.disciplinas.some(d => d.professorId === user.professorId)
    if (user.role !== 'ADMIN' && !isProfessorDaTurma) {
        throw createError({ statusCode: 403, statusMessage: 'Não autorizado' })
    }

    try {
        // Busca todos os alunos matriculados nesta turma
        const alunosNaTurma = await prisma.alunoNaTurma.findMany({
            where: { turmaId: id },
            include: {
                aluno: true
            }
        })

        // Busca todas as frequências da turma
        const frequencias = await prisma.frequencia.findMany({
            where: { turmaId: id },
            orderBy: { data: 'asc' }
        })

        // Organizar as datas únicas para as colunas
        const datasSet = new Set<string>()

        // Adiciona data de hoje
        const hoje = new Date()
        const hojeStr = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}`
        datasSet.add(hojeStr)

        frequencias.forEach(f => {
            const d = f.data
            const dataStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
            datasSet.add(dataStr)
        })

        // Ordenar as datas (exceto Matricula e Nome)
        const sortedDates = Array.from(datasSet).sort((a, b) => {
            const [diaA, mesA] = a.split('/').map(Number)
            const [diaB, mesB] = b.split('/').map(Number)
            if (mesA !== mesB) return mesA! - mesB!
            return diaA! - diaB!
        })

        const headers = ['Matricula', 'Nome', ...sortedDates]

        // Montar as linhas
        const rows = alunosNaTurma.map(rel => {
            const row: any = {
                id: rel.aluno.id,
                Matricula: rel.aluno.matricula,
                Nome: rel.aluno.nome
            }

            // Preenche as presenças deste aluno
            frequencias.filter(f => f.alunoId === rel.alunoId).forEach(f => {
                const d = f.data
                const dataStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
                row[dataStr] = f.faltas
            })

            return row
        })

        return {
            headers,
            data: rows
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao carregar frequências: ' + error.message
        })
    }
})

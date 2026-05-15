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

    if (!turma || !turma.spreadsheetId) {
        throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada ou planilha não vinculada' })
    }

    // Segurança: Admin ou Professor da turma
    const isProfessorDaTurma = turma.disciplinas.some(d => d.professorId === user.professorId)
    if (user.role !== 'ADMIN' && !isProfessorDaTurma) {
        throw createError({ statusCode: 403, statusMessage: 'Não autorizado' })
    }

    try {
        // 1. Busca todos os alunos matriculados nesta turma
        const alunosNaTurma = await prisma.alunoNaTurma.findMany({
            where: { turmaId: id },
            include: {
                aluno: true
            }
        })

        // 2. Busca todas as frequências da turma
        const frequencias = await prisma.frequencia.findMany({
            where: { turmaId: id },
            orderBy: { data: 'asc' }
        })

        if (alunosNaTurma.length === 0) {
            return { headers: ['Matricula', 'Nome'], data: [] }
        }

        // Organizar as datas únicas para as colunas
        const datasSet = new Set<string>()
        
        // Sempre garante que a data de hoje apareça como coluna
        const hojeStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        datasSet.add(hojeStr)

        frequencias.forEach(f => {
            const dataStr = f.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            datasSet.add(dataStr)
        })

        const headers = ['Matricula', 'Nome', ...Array.from(datasSet)]

        // Montar as linhas (um aluno por linha)
        const rows = alunosNaTurma.map(rel => {
            const row: any = {
                id: rel.aluno.id,
                Matricula: rel.aluno.matricula,
                Nome: rel.aluno.nome
            }

            // Preenche as presenças deste aluno específico
            frequencias.filter(f => f.alunoId === rel.alunoId).forEach(f => {
                const dataStr = f.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                row[dataStr] = f.presente ? 'P' : 'F'
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
            statusMessage: 'Erro ao carregar dados: ' + error.message
        })
    }
})

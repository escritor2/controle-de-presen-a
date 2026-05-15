export default defineEventHandler(async (event) => {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    const turma = await prisma.turma.findUnique({
        where: { id },
        include: {
            disciplinas: true
        }
    })

    if (!turma || !turma.spreadsheetId) {
        throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada ou planilha não vinculada' })
    }

    // Apenas Admin ou Professor da turma pode sincronizar
    const isProfessorDaTurma = turma.disciplinas.some(d => d.professorId === user.professorId)
    if (user.role !== 'ADMIN' && !isProfessorDaTurma) {
        throw createError({ statusCode: 403, statusMessage: 'Não autorizado' })
    }

    try {
        let spreadsheetId = turma.spreadsheetId.trim()
        
        if (spreadsheetId.includes('docs.google.com')) {
            const matches = spreadsheetId.match(/\/d\/(.*?)(\/|$)/)
            if (matches && matches[1]) {
                spreadsheetId = matches[1]
            }
        }

        // Método de exportação CSV direta - muito mais robusto
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
        const response = await $fetch<string>(url)
        
        // Converter CSV para array de linhas e colunas
        const rowsRaw = response.split('\n').map(row => {
            // Regex simples para lidar com vírgulas dentro de aspas se necessário
            return row.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim())
        })

        if (rowsRaw.length < 1) {
            throw createError({ statusCode: 400, statusMessage: 'A planilha parece estar vazia.' })
        }

        const finalCols: string[] = rowsRaw[0] || []
        const finalRows: string[][] = rowsRaw.slice(1)

        // Função para limpar string (remover acentos e espaços)
        const limpar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

        // Sincronizar Alunos e Frequências
        let alunosSincronizados = 0
        for (const rowValues of finalRows) {
            const row: any = {}
            rowValues.forEach((v: any, i: number) => {
                if (finalCols[i]) row[finalCols[i]] = v
            })

            // Tenta encontrar Nome e Matrícula por nome ou por posição (0 e 1)
            const nomeKey = Object.keys(row).find(k => ['nome', 'aluno'].includes(limpar(k)))
            const matriculaKey = Object.keys(row).find(k => ['matricula', 'rm', 'id'].includes(limpar(k)))
            
            const matricula = matriculaKey ? row[matriculaKey] : rowValues[0]
            const nome = nomeKey ? row[nomeKey] : rowValues[1]

            if (!nome || !matricula || String(nome).trim() === '' || String(nome).toLowerCase().includes('nome')) continue

            const aluno = await prisma.aluno.upsert({
                where: { matricula: String(matricula) },
                update: { nome: String(nome) },
                create: {
                    nome: String(nome),
                    matricula: String(matricula)
                }
            })

            await prisma.alunoNaTurma.upsert({
                where: {
                    alunoId_turmaId: {
                        alunoId: aluno.id,
                        turmaId: id
                    }
                },
                update: {},
                create: {
                    alunoId: aluno.id,
                    turmaId: id
                }
            })

            alunosSincronizados++

            // Processar frequências nas outras colunas
            for (let i = 0; i < finalCols.length; i++) {
                const key = finalCols[i] || ''
                const cleanKey = limpar(key)
                if (['nome', 'aluno', 'matricula', 'rm', 'id'].includes(cleanKey)) continue

                const valor = String(rowValues[i] || '').toUpperCase().trim()
                if (valor === 'P' || valor === 'F') {
                    let dataFreq = new Date()
                    const partesData = key.split('/')
                    if (partesData.length >= 2) {
                        const dia = parseInt(partesData[0] || '1')
                        const mes = parseInt(partesData[1] || '1') - 1
                        dataFreq.setDate(dia)
                        dataFreq.setMonth(mes)
                    }

                    const disciplinaId = turma.disciplinas[0]?.id
                    if (!disciplinaId) continue

                    await prisma.frequencia.upsert({
                        where: {
                            alunoId_disciplinaId_data: {
                                alunoId: aluno.id,
                                disciplinaId: disciplinaId,
                                data: dataFreq
                            }
                        },
                        update: { presente: valor === 'P' },
                        create: {
                            alunoId: aluno.id,
                            disciplinaId: disciplinaId,
                            turmaId: id,
                            data: dataFreq,
                            presente: valor === 'P'
                        }
                    })
                }
            }
        }

        return { 
            success: true, 
            message: `Sucesso! Sincronizados ${alunosSincronizados} alunos.`,
            debug: { colunas: finalCols } 
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: 'Erro na sincronização: ' + error.message })
    }
})

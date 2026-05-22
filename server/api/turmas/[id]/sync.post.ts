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

    if (!turma || !(turma as any).spreadsheetId) {
        throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada ou planilha não vinculada' })
    }

    // Apenas Admin ou Professor da turma pode sincronizar
    const isProfessorDaTurma = turma.disciplinas.some(d => d.professorId === user.professorId)
    if (user.role !== 'ADMIN' && !isProfessorDaTurma) {
        throw createError({ statusCode: 403, statusMessage: 'Não autorizado' })
    }

    try {
        let spreadsheetId = (turma as any).spreadsheetId.trim()

        if (spreadsheetId.includes('docs.google.com')) {
            const matches = spreadsheetId.match(/\/d\/(.*?)(\/|$)/)
            if (matches && matches[1]) {
                spreadsheetId = matches[1]
            }
        }

        // Método de exportação CSV direta
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`
        const csvResponse = await $fetch<string>(url)

        if (!csvResponse || csvResponse.trim() === '') {
            throw createError({ statusCode: 400, statusMessage: 'A planilha retornou vazia. Verifique as permissões de acesso.' })
        }

        // Parsing mais robusto de CSV (lidando com aspas e quebras de linha Windows)
        const lines = csvResponse.split(/\r?\n/).filter(line => line.trim() !== '')
        const rowsRaw = lines.map(line => {
            const cells = []
            let current = ''
            let inQuotes = false
            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                    inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                    cells.push(current.trim())
                    current = ''
                } else {
                    current += char
                }
            }
            cells.push(current.trim())
            return cells.map(c => c.replace(/^"(.*)"$/, '$1'))
        })

        if (rowsRaw.length < 1) {
            throw createError({ statusCode: 400, statusMessage: 'A planilha não possui dados.' })
        }

        const headers = rowsRaw[0] || []
        const dataRows = rowsRaw.slice(1)

        const limpar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

        // Identificar colunas críticas
        const colIndexMatricula = headers.findIndex(h => ['matricula', 'rm', 'id'].includes(limpar(h)))
        const colIndexNome = headers.findIndex(h => ['nome', 'aluno'].includes(limpar(h)))

        let alunosSincronizados = 0
        const logs = []

        for (const rowValues of dataRows) {
            // Pega matrícula e nome (se não achar por cabeçalho, tenta posições 0 e 1)
            const matriculaRaw = colIndexMatricula !== -1 ? rowValues[colIndexMatricula] : rowValues[0]
            const nomeRaw = colIndexNome !== -1 ? rowValues[colIndexNome] : rowValues[1]

            if (!matriculaRaw || !nomeRaw) continue
            
            const matricula = String(matriculaRaw).trim()
            const nome = String(nomeRaw).trim()

            if (matricula === '' || nome === '' || limpar(nome) === 'nome') continue

            // Upsert Aluno
            const aluno = await prisma.aluno.upsert({
                where: { matricula },
                update: { nome },
                create: { nome, matricula }
            })

            // Vincular Aluno à Turma
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

            // Processar Frequências
            for (let i = 0; i < headers.length; i++) {
                if (i === colIndexMatricula || i === colIndexNome) continue
                
                const header = headers[i] || ''
                const cleanHeader = limpar(header)
                if (['matricula', 'rm', 'id', 'nome', 'aluno'].includes(cleanHeader)) continue

                const valorStr = String(rowValues[i] || '').trim()
                const valorNum = parseInt(valorStr, 10)
                if (!isNaN(valorNum) && valorNum >= 0 && valorNum <= 5) {
                    // Tentar extrair data do cabeçalho (dd/mm)
                    let dataFreq = new Date()
                    const partesData = header.split('/')
                    if (partesData.length >= 2) {
                        const dia = parseInt(partesData[0] || '1')
                        const mes = parseInt(partesData[1] || '1') - 1
                        dataFreq = new Date(dataFreq.getFullYear(), mes, dia, 12, 0, 0)
                    }

                    const disciplinaId = turma.disciplinas[0]?.id
                    if (!disciplinaId) continue

                    await prisma.frequencia.upsert({
                        where: {
                            alunoId_disciplinaId_data: {
                                alunoId: aluno.id,
                                disciplinaId,
                                data: dataFreq
                            }
                        },
                        update: { faltas: valorNum },
                        create: {
                            alunoId: aluno.id,
                            disciplinaId,
                            turmaId: id,
                            data: dataFreq,
                            faltas: valorNum
                        }
                    })
                }
            }
        }

        return {
            success: true,
            message: `Sincronização concluída: ${alunosSincronizados} alunos processados.`,
            count: alunosSincronizados
        }

    } catch (error: any) {
        console.error('Erro na sincronização:', error)
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Erro ao processar planilha: ' + (error.message || 'Erro desconhecido') 
        })
    }
})

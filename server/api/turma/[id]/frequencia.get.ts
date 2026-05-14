export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID da turma não fornecido' })
    }

    const turma = await prisma.turma.findUnique({
        where: { id }
    })

    if (!turma || !turma.spreadsheetId) {
        throw createError({ statusCode: 404, statusMessage: 'Turma não encontrada ou planilha não vinculada' })
    }

    try {
        // Tentativa de buscar via exportação CSV (Funciona se a planilha estiver pública/com link compartilhado)
        const url = `https://docs.google.com/spreadsheets/d/${turma.spreadsheetId}/gviz/tq?tqx=out:json`
        const response = await $fetch<string>(url)
        
        // O Google retorna um JSON meio sujo (prefixado com /* / e sufixado)
        const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1)
        const data = JSON.parse(jsonStr)

        // Mapear os dados para um formato tabular simples
        const cols = data.table.cols.map((c: any) => c.label || '---')
        const rows = data.table.rows.map((r: any) => {
            const obj: any = {}
            r.c.forEach((cell: any, i: number) => {
                obj[cols[i]] = cell?.v ?? ''
            })
            return obj
        })

        return {
            headers: cols,
            data: rows
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao ler dados da planilha. Verifique se ela está compartilhada publicamente.'
        })
    }
})

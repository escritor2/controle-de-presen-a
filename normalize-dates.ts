import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function normalizeDates() {
    console.log('Normalizing dates in Frequencia table...')
    const frequencias = await prisma.frequencia.findMany()
    
    let updated = 0
    let deleted = 0

    // Group by alunoId_disciplinaId_data (ignoring time)
    const groups = new Map<string, any[]>()

    for (const f of frequencias) {
        const d = f.data
        const dataStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
        const key = `${f.alunoId}_${f.disciplinaId}_${dataStr}`
        
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(f)
    }

    for (const [key, records] of groups.entries()) {
        // Sort by updatedAt descending to keep the most recently updated record
        records.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        
        const keep = records[0]
        const remove = records.slice(1)

        // Ensure the kept record has exactly 12:00:00.000 time
        const targetDate = new Date(keep.data.getFullYear(), keep.data.getMonth(), keep.data.getDate(), 12, 0, 0)
        
        if (keep.data.getTime() !== targetDate.getTime()) {
            await prisma.frequencia.update({
                where: { id: keep.id },
                data: { data: targetDate }
            })
            updated++
        }

        // Delete duplicates
        for (const r of remove) {
            await prisma.frequencia.delete({ where: { id: r.id } })
            deleted++
        }
    }

    console.log(`Finished. Updated ${updated} records, deleted ${deleted} duplicates.`)
}

normalizeDates().catch(console.error).finally(() => prisma.$disconnect())

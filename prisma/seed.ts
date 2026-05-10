import { PrismaClient } from "@prisma/client"
import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({url:process.env.DATABASE_URL!})
const prisma = new PrismaClient({adapter})

async function main(){
    console.log("Iniciando seed")

    await prisma.frequencia.deleteMany()
    await prisma.alunoNaTurma.deleteMany()
    await prisma.disciplina.deleteMany()
    await prisma.turma.deleteMany()
    await prisma.curso.deleteMany()
    await prisma.professor.deleteMany()
    await prisma.user.deleteMany()

    const admin = await prisma.user.create({
        data: {
            email: 'admin@admin.com',
            senha: '$2b$10$EpjXNoS27srLndAgtY2.reOn.Kx.uCqT.KAtE5q8sS2L.Z0s.A4O.',
            role: 'ADMIN'
        }
    })

    const cursoRima = await prisma.curso.create({
        data: {nome: "Mestrado em Batalha de Rimas"}
    })

    const turmaLegal = await prisma.turma.create({
        data:{
            nome: 'Turma mais bizonha do mundo',
            termo: 1,
            codigo:'T-BR3',
            periodo: 'Noite',
            cursoId: cursoRima.id
        }
    })

    const userProf = await prisma.user.create({
        data: {
            email: 'mc.gorilla@escolar.com',
            senha: '$2a$12$a6Wa8nxFjQDtfErf/ndijuxoFLNq7VfPlNSyJLD6oQ23KI3DjpXNW',
            role: 'PROFESSOR'
        }
    })


    console.log("fim.")
}

main()
.catch(e => {
    console.error(e)
    process.exit(1)
})
.finally(async ()=> {
    await prisma.$disconnect()
})
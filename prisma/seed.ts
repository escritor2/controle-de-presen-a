import { PrismaClient } from "@prisma/client"
import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { hashPassword } from "../server/utils/hash"

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

    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.user.create({
        data: {
            email: 'admin@admin.com',
            senha: adminPassword,
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

    const professorPassword = await hashPassword('professor123')
    const userProf = await prisma.user.create({
        data: {
            email: 'mc.gorilla@escolar.com',
            senha: professorPassword,
            role: 'PROFESSOR',
            professor: {
                create: {
                    nome: 'MC Gorilla'
                }
            }
        },
        include: {
            professor: true
        }
    })

    // Criar uma disciplina para o professor
    await prisma.disciplina.create({
        data: {
            nome: 'Rimas de Verão',
            turmaId: turmaLegal.id,
            professorId: userProf.professor!.id
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
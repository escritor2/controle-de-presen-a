export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    // 1. Encontrar todos os usuários com papel PROFESSOR
    const usuariosProfessores = await prisma.user.findMany({
        where: { role: 'PROFESSOR' },
        include: { professor: true }
    })

    // 2. Para cada usuário que não tem o registro na tabela Professor, criar um
    for (const user of usuariosProfessores) {
        if (!user.professor) {
            console.log(`Criando perfil de professor para: ${user.email}`)
            await prisma.professor.create({
                data: {
                    userId: user.id,
                    nome: user.email.split('@')[0] // Nome padrão baseado no e-mail
                } as any
            })
        }
    }

    // 3. Retornar a lista atualizada de professores
    return await prisma.professor.findMany({
        orderBy: {
            nome: 'asc'
        }
    })
})

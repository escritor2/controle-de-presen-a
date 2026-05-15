# 📝 Sistema de Controle de Presença

Este é um sistema robusto para gestão de frequência escolar, desenvolvido com tecnologias modernas para oferecer uma experiência fluida tanto para administradores quanto para professores e empresas parceiras.

## 🚀 Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema JavaScript/TypeScript:

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 + Nitro)
- **Interface**: [Nuxt UI](https://ui.nuxt.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados & ORM**: [Prisma](https://www.prisma.io/) com SQLite (suporte para PostgreSQL)
- **Validação**: [Zod](https://zod.dev/)
- **Autenticação**: Customizada com `bcrypt` e Middleware de segurança
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)

## ✨ Funcionalidades Principais

- **Gestão Multi-Nível (RBAC)**:
  - **ADMIN**: Controle total sobre o sistema (usuários, cursos, turmas).
  - **EMPRESA**: Visualização de frequência de alunos vinculados à empresa.
  - **PROFESSOR**: Registro e acompanhamento de presença por disciplina.
- **Estrutura Acadêmica**:
  - Organização por **Cursos**, **Turmas** e **Disciplinas**.
  - Suporte a subdivisões de turmas (**Subturma A**, **B** ou **Geral**).
- **Controle de Frequência**:
  - Registro de presença simplificado por disciplina e data.
  - Observações personalizadas por registro de aluno.
- **Gestão de Alunos**:
  - Vínculo de alunos a múltiplas turmas e empresas.

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js (v20 ou superior)
- npm ou pnpm

### Passos para Instalação

1. **Clonar o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd controle-de-presen-a
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto (veja o `.env.example` se disponível):
   ```env
   DATABASE_URL="file:./prisma/database.db"
   ```

4. **Preparar o banco de dados**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   O sistema estará disponível em `http://localhost:3000`.

## 📁 Estrutura do Projeto

- `/app`: Interface do usuário (Vue/Nuxt).
- `/server/api`: Endpoints da API (H3/Nitro).
- `/server/utils`: Utilitários de backend (Auth, Prisma).
- `/prisma`: Schema do banco de dados e scripts de seed.

## 🤝 Contribuição

1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3. Faça o Commit de suas alterações (`git commit -m 'Adicionando nova feature'`).
4. Faça o Push para a Branch (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

---
Desenvolvido para facilitar a gestão acadêmica.

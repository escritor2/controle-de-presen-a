# Sistema de Controle de Presença

Este é um sistema robusto para gestão de frequência escolar, desenvolvido com tecnologias modernas para oferecer uma experiência fluida tanto para administradores quanto para professores e empresas parceiras.

## Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema JavaScript/TypeScript:

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 + Nitro)
- **Interface**: [Nuxt UI](https://ui.nuxt.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados & ORM**: [Prisma](https://www.prisma.io/) com SQLite (suporte para PostgreSQL)
- **Validação**: [Zod](https://zod.dev/)
- **Autenticação**: Customizada com `bcrypt` e Middleware de segurança
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)

## Funcionalidades Principais

- **Gestão Multi-Nível (RBAC)**:
  - **ADMIN**: Controle total sobre o sistema (usuários, cursos, turmas).
  - **PROFESSOR**: Registro e acompanhamento de presença por disciplina.
- **Estrutura Acadêmica**:
  - Organização por **Cursos**, **Turmas** e **Disciplinas**.
  - Suporte a subdivisões de turmas (**Subturma A**, **B** ou **Geral**).
- **Controle de Frequência**:
  - Registro de presença simplificado por disciplina e data.
  - Observações personalizadas por registro de aluno.
- **Gestão de Alunos**:
  - Vínculo de alunos a múltiplas turmas e empresas.

## 📊 Integração Google Sheets (Sincronização Automática)

O sistema possui uma funcionalidade de sincronização reversa. Sempre que uma presença é marcada no Dashboard, a planilha original do Google Sheets é atualizada automaticamente em tempo real.

### Como Configurar:

1.  **Apps Script Proxy**:
    *   Abra sua planilha do Google.
    *   Vá em `Extensões > Apps Script`.
    *   Cole o código do script de Proxy (disponível no [Guia de Configuração do Google Sheets](docs/GOOGLE_SHEETS_SETUP.md)).
    *   Clique em `Implantar > Nova Implantação`.
    *   Selecione `App da Web`, execute como **"Você"** e dê acesso a **"Qualquer pessoa"**.
    *   Copie a URL gerada e cole no servidor do sistema.

2.  **Permissões de Compartilhamento**:
    *   Para que o sistema consiga atualizar planilhas de outros professores, o professor deve **compartilhar a planilha** com o e-mail que criou o Apps Script (permissão de Editor).

3.  **Segurança**:
    *   A comunicação é protegida por um `SYNC_TOKEN` definido no arquivo `.env`.
    *   Somente requisições com o token correto são processadas pelo Google.

4.  **Inicialização Rápida**:
    *   No painel administrativo, use o botão **"Exportar Alunos para Google"** para criar automaticamente o cabeçalho e a lista de alunos em uma planilha em branco.

---

## 🛠️ Instalação e Execução

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

## Estrutura do Projeto

- `/app`: Interface do usuário (Vue/Nuxt).
- `/server/api`: Endpoints da API (H3/Nitro).
- `/server/utils`: Utilitários de backend (Auth, Prisma).
- `/prisma`: Schema do banco de dados e scripts de seed.

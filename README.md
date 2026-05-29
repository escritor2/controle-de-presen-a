# Sistema de Controle de Presença

Este é um sistema robusto para gestão de frequência escolar, projetado para oferecer uma experiência fluida para administradores, professores e empresas parceiras. A plataforma permite o acompanhamento em tempo real das presenças de alunos por disciplinas e turmas, com sincronização automática e bidirecional com o Google Sheets.

---

##  Tecnologias Utilizadas

O ecossistema técnico do projeto foi desenvolvido com tecnologias modernas de alto desempenho:

* **Framework Frontend e Backend:** [Nuxt 4](https://nuxt.com/) (Vue 3 + Nitro Engine)
* **Design & UI:** [Nuxt UI v3/v4](https://ui.nuxt.com/) & [Tailwind CSS](https://tailwindcss.com/)
* **Banco de Dados & ORM:** [Prisma](https://www.prisma.io/) com SQLite (ambiente local) e suporte a PostgreSQL (produção)
* **Validação de Esquemas:** [Zod](https://zod.dev/)
* **Criptografia & Segurança:**
  * Hashes de senha utilizando `bcrypt`.
  * Sessões criptografadas através de cookies com assinaturas baseadas em HMAC-SHA256 (módulo `crypto` nativo do Node.js).
  * Proteção rigorosa contra adulteração de identidade (Session Hijacking / IDOR).
  * Autorizações granulares a nível de objeto (BOLA) para lançamentos de frequência.

---

##  Funcionalidades Principais

* **Controle de Acesso Baseado em Perfis (RBAC):**
  * **ADMIN:** Acesso total à administração de usuários, cursos, turmas, atribuições de professores e gerenciamento de alunos.
  * **PROFESSOR:** Lançamento de presença simplificado, controle de faltas e visualização de turmas associadas.
  * **EMPRESA:** Acompanhamento de presença e relatórios dos alunos vinculados à empresa.
* **Gestão Escolar Avançada:**
  * Divisão curricular em Cursos, Turmas e Disciplinas.
  * Suporte a Subturmas (Geral, Subturma A, Subturma B).
* **Lançamento de Frequência Inteligente:**
  * Grid de presença dinâmico com cores indicativas (Verde para presença total, Laranja para faltas parciais e Vermelho para faltas totais).
  * Sistema interativo de cliques rápidos (incrementos automáticos de 0 a 5 faltas).
  * Inclusão de observações personalizadas por data e por aluno.
* **Sincronização com o Google Sheets:**
  * Sincronização em tempo real das faltas marcadas no sistema local com as colunas de data do Google Sheets.
  * Botão de exportação automatizada para preparar a estrutura da planilha e sincronizar todos os alunos da turma de uma única vez.

---

##  Instalação e Inicialização Local

Siga os passos abaixo para rodar o projeto em seu computador.

### Pré-requisitos
* **Node.js:** Versão 20 ou superior.
* **Gerenciador de pacotes:** `npm` (incluso no Node.js).

### Passos para Configuração

#### 1. Instalar as Dependências
Abra o terminal na pasta do projeto e execute:
```bash
npm install
```

#### 2. Configurar o Arquivo de Ambiente
Crie um arquivo chamado `.env` na raiz do projeto (utilize o `.env.example` como modelo):
```env
DATABASE_URL="file:./prisma/database.db"
SYNC_TOKEN="token123"
LINK_PROXY="https://script.google.com/macros/s/SUA_URL_DO_WEB_APP_AQUI/exec"
```
* *DATABASE_URL:* Localização do banco de dados SQLite local.
* *SYNC_TOKEN:* Senha compartilhada entre o sistema local e o Google Apps Script (use o mesmo valor em ambos).
* *LINK_PROXY:* A URL de implantação gerada no Google Apps Script (veja o guia de configuração na pasta `docs/`).

#### 3. Inicializar e Popular o Banco de Dados
Gere os esquemas do Prisma, execute as migrações locais e popule o banco de dados com dados de teste:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

#### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`.

---

##  Boas Práticas e Arquitetura de Segurança Aplicadas

O projeto passou por uma revisão de código que implementou melhorias fundamentais de engenharia:
1. **Sessões à Prova de Falsificação:** O cookie de autenticação não utiliza IDs expostos. O token é assinado no servidor usando uma chave secreta e hash HMAC. Qualquer alteração manual no navegador invalida o token e expira o acesso imediatamente.
2. **Prevenção a Ataques BOLA:** A rota de salvamento de faltas valida síncronamente se o usuário autenticado é o professor responsável por alguma disciplina da turma, impedindo que contas não autorizadas gravem faltas em turmas alheias.
3. **Consistência de Timezones:** As datas são manipuladas em UTC absoluto e fixadas no meio-dia. Isso previne que a diferença de fusos horários locais de servidores na nuvem desloque as datas de presença dos alunos.
4. **Compatibilidade com PostgreSQL:** As consultas do Prisma utilizam `mode: 'insensitive'` nas buscas por texto, garantindo funcionamento idêntico e insensível a maiúsculas/minúsculas tanto em SQLite quanto em PostgreSQL.

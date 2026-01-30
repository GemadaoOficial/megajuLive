# Shopee Live System

Sistema completo para gestão e tutorial de Lives na Shopee, com analytics e integração de IA.

## Estrutura do Projeto

- **/client**: Frontend em React + Vite + Tailwind CSS
- **/server**: Backend em Node.js + Express + Prisma

## Configuração Inicial

### 1. Instalação das Dependências

Se você acabou de clonar/criar este projeto, instale as dependências:

```bash
# Na raiz do projeto
npm run install:all
```
Ou manualmente:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Banco de Dados (PostgreSQL)

Certifique-se de ter um banco de dados PostgreSQL rodando e atualize o arquivo `/server/.env` com sua connection string `DATABASE_URL`.

```bash
# Rodar Migrations
cd server
npx prisma migrate dev --name init

# Popular banco com dados iniciais (Admin e Módulos)
npm run prisma:seed
```

### 3. Executando o Projeto

Para rodar backend e frontend simultaneamente:

```bash
# Na raiz do projeto (necessário npm install na raiz)
npm start
```

Ou separadamente:
```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

## Credenciais Padrão (Seed)

- **Admin**: `admin@shopee.com` / `admin123`
- **Colaborador**: `colaborador@shopee.com` / `collab123`

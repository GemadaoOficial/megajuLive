# MegaJu Live - Sistema de Gerenciamento de Lives

Sistema completo para gerenciamento de transmissoes ao vivo para e-commerce, com dashboard interativo, analytics em tempo real, e ferramentas de producao.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

## Screenshots

### Dashboard
- Visao geral com metricas de engajamento e vendas
- Graficos interativos com periodo selecionavel (7, 30, 90, 365 dias)
- Atividades recentes e proximas lives agendadas

### Analytics
- Metricas completas: visualizacoes, curtidas, comentarios, compartilhamentos
- Comparacao historica entre qualquer duas datas
- Dados armazenados permanentemente para analise de longo prazo

### Live Executor
- Timer de transmissao em tempo real
- Gerenciamento de produtos durante a live
- Assistente IA para geracao de titulos
- Estatisticas ao vivo (views, vendas, receita)

## Funcionalidades

### Dashboard
- Cards de estatisticas com animacoes
- Graficos de linha/area para tendencias
- Lista de lives agendadas
- Atividades recentes (audit log)
- Acoes rapidas

### Analytics e Relatorios
- **Visao Geral**: Metricas de engajamento e vendas
- **Comparar Datas**: Compare metricas entre qualquer duas datas
- Graficos interativos (Recharts)
- Exportacao de dados
- Historico permanente de snapshots

### Gerenciamento de Lives
- Criar/editar/excluir lives
- Timer de transmissao
- Status: SCHEDULED, LIVE, COMPLETED, CANCELLED
- Gerenciamento de produtos por live

### Sistema de Autenticacao
- Login/Registro com JWT
- Refresh Token automatico
- Roles: ADMIN, COLABORADOR
- Gerenciamento de usuarios (admin)

### Calendario
- Visualizacao mensal de lives agendadas
- Drag and drop (futuro)
- Cores por status

### Auditoria
- Log de todas as acoes do sistema
- Filtros por usuario, acao, entidade
- Detalhes completos de cada evento

## Tecnologias

### Frontend
- **React 18** com Vite
- **TailwindCSS** para estilizacao
- **Framer Motion** para animacoes
- **Recharts** para graficos
- **Lucide React** para icones
- **React Router DOM** para rotas

### Backend
- **Express.js** com TypeScript
- **Prisma ORM** com SQLite
- **JWT** para autenticacao
- **bcryptjs** para hash de senhas

## Instalacao

### Pre-requisitos
- Node.js 18+
- npm ou yarn

### Passo a passo

1. **Clone o repositorio**
```bash
git clone https://github.com/GemadaoOficial/megajuLive.git
cd megajuLive
```

2. **Instale as dependencias do servidor**
```bash
cd server
npm install
```

3. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

4. **Crie usuarios de teste (opcional)**
```bash
npx tsx src/scripts/seedUsers.ts
```

5. **Instale as dependencias do cliente**
```bash
cd ../client
npm install
```

6. **Inicie os servidores**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Ou use o script Windows:
```bash
start.bat
```

## Credenciais de Teste

| Email | Senha | Role |
|-------|-------|------|
| admin@megaju.com | admin123 | ADMIN |
| user@megaju.com | user123 | COLABORADOR |

## Estrutura do Projeto

```
megajuLive/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizaveis
│   │   │   ├── layout/     # Header, Sidebar
│   │   │   └── ui/         # Button, Input, Modal, etc.
│   │   ├── contexts/       # AuthContext
│   │   ├── pages/          # Paginas da aplicacao
│   │   │   ├── analytics/  # Relatorios e graficos
│   │   │   ├── audit/      # Logs de auditoria
│   │   │   ├── auth/       # Login/Register
│   │   │   ├── calendar/   # Calendario de lives
│   │   │   ├── dashboard/  # Dashboard principal
│   │   │   ├── live/       # Executor de lives
│   │   │   └── users/      # Gerenciamento de usuarios
│   │   ├── services/       # API client (axios)
│   │   └── App.jsx         # Rotas principais
│   └── package.json
│
├── server/                 # Backend Express
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco
│   ├── src/
│   │   ├── middlewares/    # Auth middleware
│   │   ├── routes/         # Endpoints da API
│   │   │   ├── admin.ts
│   │   │   ├── analytics.ts
│   │   │   ├── analytics-history.ts
│   │   │   ├── audit.ts
│   │   │   ├── auth.ts
│   │   │   ├── lives.ts
│   │   │   └── modules.ts
│   │   ├── scripts/        # Scripts utilitarios
│   │   └── index.ts        # Entry point
│   └── package.json
│
├── start.bat               # Script para iniciar ambos
└── README.md
```

## API Endpoints

### Autenticacao
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario atual
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Lives
- `GET /api/lives` - Listar lives (com paginacao e filtros)
- `GET /api/lives/:id` - Detalhes de uma live
- `POST /api/lives` - Criar live
- `PUT /api/lives/:id` - Atualizar live
- `DELETE /api/lives/:id` - Excluir live
- `POST /api/lives/:id/start` - Iniciar live
- `POST /api/lives/:id/end` - Encerrar live

### Analytics
- `GET /api/analytics` - Metricas atuais
- `GET /api/analytics-history/summary` - Resumo do periodo
- `GET /api/analytics-history/snapshots` - Snapshots por data
- `GET /api/analytics-history/compare` - Comparar duas datas
- `POST /api/analytics-history/snapshot/seed` - Gerar dados de exemplo

### Admin
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users` - Criar usuario
- `PUT /api/admin/users/:id` - Atualizar usuario
- `DELETE /api/admin/users/:id` - Excluir usuario

### Auditoria
- `GET /api/audit` - Listar logs
- `GET /api/audit/:id` - Detalhes do log
- `GET /api/audit/stats` - Estatisticas

## Variaveis de Ambiente

### Server (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts Disponiveis

### Server
```bash
npm run dev      # Inicia com hot-reload (tsx watch)
npm run build    # Compila TypeScript
npm run start    # Inicia em producao
```

### Client
```bash
npm run dev      # Inicia Vite dev server
npm run build    # Build para producao
npm run preview  # Preview do build
```

## Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudancas (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

**Gemadao Oficial** - [GitHub](https://github.com/GemadaoOficial)

---

Feito com massa por MegaJu

# 🚀 Deploy no Railway - Guia Completo

## 📋 Pré-requisitos

✅ Conta no GitHub (grátis)
✅ Conta no Railway (grátis - https://railway.app)
✅ Projeto commitado no Git local

---

## 🎯 Passo a Passo (15 minutos)

### 1️⃣ Subir para o GitHub

```bash
# Se ainda não tem repositório remoto, crie um em: https://github.com/new
# Nome sugerido: megaju-live

# Adicione o remote
git remote add origin https://github.com/SEU_USUARIO/megaju-live.git

# Suba o código
git push -u origin main
```

---

### 2️⃣ Criar Projeto no Railway

1. Acesse: **https://railway.app**
2. Clique em **"Login with GitHub"**
3. Autorize o Railway
4. Clique em **"New Project"**
5. Selecione **"Deploy from GitHub repo"**
6. Escolha o repositório **megaju-live**

---

### 3️⃣ Configurar Banco de Dados PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database" → "PostgreSQL"**
3. Aguarde o banco ser criado (~30 segundos)
4. Clique no serviço **PostgreSQL**
5. Vá na aba **"Variables"**
6. Copie o valor de **DATABASE_URL**

---

### 4️⃣ Configurar Variáveis de Ambiente

1. Clique no serviço do **seu app** (megaju-live)
2. Vá em **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione as seguintes variáveis:

```
DATABASE_URL=<cole-a-url-do-postgres-aqui>
JWT_SECRET=shopee-live-production-secret-key-2024
PORT=5000
OPENAI_API_KEY=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
NODE_ENV=production
```

---

### 5️⃣ Deploy Automático

Railway vai detectar as mudanças e fazer deploy automático!

Acompanhe o progresso em **"Deployments"**:
- ⏳ Building...
- ⏳ Deploying...
- ✅ Success!

---

### 6️⃣ Criar Usuários Iniciais (Seed)

Após o deploy bem-sucedido:

1. No serviço do app, vá em **"Settings"**
2. Role até **"Deploy Triggers"**
3. Ou execute manualmente:
   - Clique em **"..."** no último deployment
   - Selecione **"View Logs"**
   - Veja se os usuários foram criados automaticamente

**Ou execute o seed manualmente:**
1. Vá em **"Settings" → "Deploy"**
2. Em **"Custom Start Command"** (opcional)
3. Ou conecte via CLI do Railway

---

### 7️⃣ Obter URL Pública

1. Clique no serviço do app
2. Vá em **"Settings"**
3. Em **"Networking"** → **"Public Networking"**
4. Clique em **"Generate Domain"**
5. Copie a URL gerada: `https://megaju-live-production.up.railway.app`

---

## ✅ Testar o Deploy

Acesse a URL gerada e faça login:

```
Email: admin@megaju.com
Senha: admin123
```

ou

```
Email: user@megaju.com
Senha: user123
```

---

## 🔥 Vantagens do Railway

✅ **Deploy automático** - Push no GitHub = Deploy automático
✅ **HTTPS grátis** - Certificado SSL incluído
✅ **Banco PostgreSQL** - Incluído no plano free
✅ **Logs em tempo real** - Debugging fácil
✅ **Zero configuração** - Detecta Node.js automaticamente
✅ **500h/mês grátis** - Mais que suficiente para demonstração

---

## 💰 Custos

**Free Tier:**
- $5 créditos/mês (500h de uso)
- PostgreSQL incluído
- SSL/HTTPS incluído
- Perfeito para demonstração!

**Uso estimado deste projeto:**
- ~$2-3/mês (bem abaixo do limite free)

---

## 🐛 Troubleshooting

### Deploy falhou?
1. Veja os logs em **"Deployments" → clique no deployment → "View Logs"**
2. Procure por erros vermelhos
3. Verifique se todas as variáveis de ambiente estão configuradas

### Banco de dados não conecta?
1. Verifique se `DATABASE_URL` está correta
2. Certifique-se que o PostgreSQL está rodando (ícone verde)
3. Teste a conexão em **"PostgreSQL" → "Connect"**

### Usuários não foram criados?
1. O seed roda automaticamente no primeiro start
2. Ou execute manualmente via Railway CLI
3. Ou adicione via admin panel após login inicial

---

## 📱 Apresentar ao Chefe

**URL para compartilhar:**
```
https://megaju-live-production.up.railway.app
```

**Login:**
```
Email: admin@megaju.com
Senha: admin123
```

**Pontos de destaque:**
- ✅ Sistema profissional com IA integrada
- ✅ Hospedagem na nuvem com SSL
- ✅ Acessível de qualquer lugar
- ✅ Custo: R$ 50/mês (muito barato)
- ✅ ROI em 1 semana

---

**Boa apresentação! 🎉**

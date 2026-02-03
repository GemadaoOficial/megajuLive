import {
  Sparkles,
  Monitor,
  Layout,
  Video,
  Coins,
  FileText,
  Users,
  BarChart3,
  AlertTriangle,
  UserCheck,
  FileDown,
  CheckSquare,
  MessageSquare,
  Phone,
  HelpCircle,
  RefreshCw,
} from 'lucide-react'

export const trainingVideos = [
  {
    id: 'video-1',
    moduleNumber: 1,
    title: 'Bem-vindo e Visao Geral',
    duration: '5-8 min',
    icon: Sparkles,
    gradient: 'from-amber-400 to-orange-500',
    description: 'Apresentacao da empresa e sua funcao como operador de live',
    videoUrl: null, // Adicionar URL do video quando disponivel
    topics: [
      'Apresentacao da empresa',
      'Sua funcao como operador de live',
      'Metas e expectativas',
      'Estrutura do treinamento',
      'Horarios e escalas',
    ],
    content: `# Bem-vindo ao Time de Lives MegaJu!

## Sobre a Empresa
Voce agora faz parte de uma equipe dedicada a revolucionar as vendas ao vivo na MegaJu. Nossa missao e proporcionar experiencias de compra envolventes e aumentar as vendas atraves de transmissoes de alta qualidade.

## Sua Funcao
Como operador de live, voce sera responsavel por:
- Conduzir transmissoes ao vivo de forma profissional
- Apresentar produtos de maneira atraente
- Interagir com a audiencia em tempo real
- Maximizar as vendas durante as lives

## Metas e Expectativas
- Manter alta taxa de engajamento
- Atingir metas de vendas estabelecidas
- Seguir os padroes de qualidade da empresa
- Evoluir constantemente suas habilidades

## Estrutura do Treinamento
Este treinamento e composto por 10 modulos que cobrirao todos os aspectos necessarios para voce se tornar um operador de lives de sucesso.

## Horarios e Escalas
- Lives acontecem em horarios pre-definidos
- Escalas serao comunicadas semanalmente
- Pontualidade e fundamental
- Comunicar ausencias com antecedencia`,
  },
  {
    id: 'video-2',
    moduleNumber: 2,
    title: 'Programas e Ferramentas',
    duration: '8-12 min',
    icon: Monitor,
    gradient: 'from-blue-400 to-cyan-500',
    description: 'Instalacao e configuracao de todos os programas necessarios',
    videoUrl: null,
    topics: [
      'App MegaJu (loja oficial)',
      'App MegaJu Live',
      'OBS Studio (para computador)',
      'WhatsApp Business',
      'Google Drive/Planilhas',
      'Configuracoes iniciais e logins',
    ],
    content: `# Programas e Ferramentas Necessarias

## Programas para Baixar/Instalar

### 1. App MegaJu (Loja Oficial)
- Baixe na Play Store ou App Store
- Use a conta corporativa fornecida
- Mantenha sempre atualizado

### 2. App MegaJu Live
- Aplicativo dedicado para transmissoes
- Recursos avancados de live
- Melhor performance para streaming

### 3. OBS Studio (Para Computador)
- Software gratuito de transmissao
- Permite configuracoes avancadas
- Ideal para setup profissional
- Download: obsproject.com

### 4. WhatsApp Business
- Comunicacao com clientes
- Grupos internos da equipe
- Suporte rapido

### 5. Google Drive/Planilhas
- Controle de produtos
- Relatorios de vendas
- Arquivos compartilhados

## Configuracoes Iniciais

### Login nas Contas
- Use apenas credenciais corporativas
- Nao compartilhe senhas
- Ative autenticacao em 2 fatores

### Permissoes e Acessos
- Solicite acessos ao supervisor
- Verifique permissoes de transmissao
- Teste antes da primeira live

### Arquivos Compartilhados
- Pasta de produtos no Drive
- Planilhas de controle
- Materiais de apoio`,
  },
  {
    id: 'video-3',
    moduleNumber: 3,
    title: 'Navegando na MegaJu Seller',
    duration: '10-15 min',
    icon: Layout,
    gradient: 'from-violet-400 to-purple-500',
    description: 'Interface completa da plataforma e gerenciamento de produtos',
    videoUrl: null,
    topics: [
      'Dashboard principal',
      'Visualizacao de pedidos',
      'Gerenciamento de produtos',
      'Chat com clientes',
      'Configuracoes da loja',
      'Preparando produtos para live',
      'Editando precos e promocoes',
      'Configurando estoque e cupons',
    ],
    content: `# Navegando na MegaJu Seller

## Interface da Plataforma

### Dashboard Principal
- Visao geral das metricas
- Vendas do dia/semana/mes
- Notificacoes importantes
- Acesso rapido as funcoes

### Onde Ver Pedidos
- Menu "Pedidos"
- Filtros por status
- Detalhes de cada pedido
- Historico completo

### Gerenciamento de Produtos
- Listagem de produtos
- Adicionar novos itens
- Editar informacoes
- Controle de estoque

### Chat com Clientes
- Central de mensagens
- Respostas rapidas
- Historico de conversas

### Configuracoes da Loja
- Informacoes basicas
- Politicas de envio
- Metodos de pagamento

## Preparando Produtos para Live

### Adicionando Produtos na Live
1. Acesse a area de Lives
2. Selecione "Adicionar Produtos"
3. Escolha os itens do catalogo
4. Defina ordem de apresentacao

### Editando Precos e Promocoes
- Precos especiais para live
- Descontos por tempo limitado
- Combos e kits

### Configurando Estoque
- Verifique disponibilidade
- Reserve estoque para live
- Atualize em tempo real

### Cupons de Desconto
- Crie cupons exclusivos
- Defina regras de uso
- Limite por cliente`,
  },
  {
    id: 'video-4',
    moduleNumber: 4,
    title: 'Como Iniciar uma Live',
    duration: '12-18 min',
    icon: Video,
    gradient: 'from-red-400 to-pink-500',
    description: 'Passo a passo completo para iniciar e conduzir uma transmissao',
    videoUrl: null,
    topics: [
      'Abrindo o app/sistema',
      'Criando nova transmissao',
      'Configurando titulo e descricao',
      'Adicionando produtos',
      'Checklist pre-live (luz, som, internet)',
      'Iniciando a transmissao',
      'Controles durante a live',
      'Finalizando corretamente',
    ],
    content: `# Como Iniciar uma Live

## Passo a Passo Completo

### 1. Abrindo o App/Sistema
- Abra o MegaJu Live
- Faca login com sua conta
- Verifique conexao com internet

### 2. Criando Nova Transmissao
- Toque em "Criar Live"
- Selecione categoria
- Escolha template se disponivel

### 3. Configurando Titulo e Descricao
- Titulo atrativo (max 50 caracteres)
- Descricao com produtos principais
- Use emojis com moderacao
- Inclua palavras-chave

### 4. Adicionando Produtos
- Selecione produtos do catalogo
- Ordene por prioridade
- Verifique precos e estoque
- Adicione tags de promocao

### 5. Checklist Pre-Live
- [ ] Iluminacao adequada
- [ ] Microfone funcionando
- [ ] Internet estavel (min 10mbps)
- [ ] Produtos organizados
- [ ] Ambiente arrumado
- [ ] Agua disponivel

### 6. Iniciando a Transmissao
- Revise todas configuracoes
- Faca teste de audio/video
- Inicie com saudacao padrao

### 7. Controles Durante a Live
- Fixar produtos em destaque
- Responder comentarios
- Monitorar metricas
- Ajustar camera se necessario

### 8. Finalizando Corretamente
- Agradeca a audiencia
- Lembre dos produtos
- Anuncie proxima live
- Encerre pelo app`,
  },
  {
    id: 'video-5',
    moduleNumber: 5,
    title: 'Recursos da Live - Moedas e Sorteios',
    duration: '10-15 min',
    icon: Coins,
    gradient: 'from-yellow-400 to-amber-500',
    description: 'Sistema de moedas, sorteios e recursos interativos',
    videoUrl: null,
    topics: [
      'O que sao moedas MegaJu',
      'Como clientes ganham moedas',
      'Usando moedas como incentivo',
      'Tipos de sorteio disponiveis',
      'Passo a passo para criar sorteios',
      'Flash sale (ofertas relampago)',
      'Cupons exclusivos da live',
      'Jogos interativos da plataforma',
    ],
    content: `# Recursos da Live - Moedas e Sorteios

## Sistema de Moedas MegaJu

### O Que Sao as Moedas
- Moeda virtual da plataforma
- Podem ser usadas como desconto
- Incentivam engajamento

### Como Clientes Ganham
- Assistindo lives
- Interagindo (comentarios, curtidas)
- Compartilhando transmissao
- Participando de jogos

### Usando Moedas como Incentivo
- Anuncie chuvas de moedas
- Crie metas de engajamento
- Recompense participacao

## Criando Sorteios

### Tipos Disponiveis
- Sorteio por comentario
- Sorteio por tempo assistido
- Sorteio para compradores

### Passo a Passo
1. Acesse menu de sorteios
2. Defina premio
3. Configure regras
4. Defina duracao
5. Inicie o sorteio
6. Aguarde participacao
7. Realize o sorteio
8. Anuncie vencedor

### Validando Ganhadores
- Verifique elegibilidade
- Confirme dados
- Registre no sistema

## Outros Recursos Interativos

### Flash Sale
- Ofertas por tempo limitado
- Crie urgencia
- Destaque desconto

### Cupons Exclusivos
- Cupons so para live
- Codigo especial
- Tempo limitado

### Jogos da Plataforma
- Quiz interativo
- Roleta de premios
- Desafios para audiencia`,
  },
  {
    id: 'video-6',
    moduleNumber: 6,
    title: 'Roteiro e Apresentacao',
    duration: '12-15 min',
    icon: FileText,
    gradient: 'from-emerald-400 to-teal-500',
    description: 'Estrutura da live, tecnicas de apresentacao e roteiro',
    videoUrl: null,
    topics: [
      'Abertura padrao (script)',
      'Como apresentar cada produto',
      'Tecnicas de persuasao basicas',
      'Interagindo com comentarios',
      'Call-to-action e fechamento',
      'Tom de voz e linguagem corporal',
      'Erros comuns a evitar',
      'Template de roteiro pratico',
    ],
    content: `# Roteiro e Apresentacao

## Estrutura da Live

### Abertura Padrao (5 minutos)
"Oi gente, tudo bem? Sejam muito bem-vindos a mais uma live!
Hoje temos ofertas INCRIVEIS pra voces!
Ja deixa seu like, compartilha com os amigos e bora comecar!"

### Apresentando Cada Produto
1. Mostre o produto em destaque
2. Fale nome e principais caracteristicas
3. Demonstre uso se possivel
4. Destaque o preco/desconto
5. Crie urgencia (estoque limitado)
6. Call-to-action claro

### Tecnicas de Persuasao
- Escassez: "Ultimas unidades!"
- Urgencia: "So ate o fim da live!"
- Prova social: "Ja vendemos X unidades!"
- Beneficio: Foque no que resolve

### Interagindo com Comentarios
- Leia nomes em voz alta
- Responda perguntas rapidamente
- Agradeca participacao
- Crie conexao pessoal

### Fechamento
"Gente, foi MARAVILHOSO estar com voces!
Nao esquecam de finalizar suas compras!
Sigam a loja pra nao perder as proximas lives!
Ate a proxima, beijos!"

## Boas Praticas

### Tom de Voz
- Animado mas natural
- Volume adequado
- Varie entonacao
- Transmita entusiasmo

### Linguagem Corporal
- Sorria sempre
- Olhe para camera
- Gesticule naturalmente
- Postura confiante

### Erros Comuns
- Falar rapido demais
- Ignorar comentarios
- Nao demonstrar produto
- Ficar estatico
- Tom monotono

## Template de Roteiro

| Tempo | Acao |
|-------|------|
| 0-5min | Abertura e boas-vindas |
| 5-15min | Produto 1 + interacao |
| 15-25min | Produto 2 + sorteio |
| 25-35min | Produto 3 + flash sale |
| 35-45min | Produtos restantes |
| 45-50min | Recapitulacao + fechamento |`,
  },
  {
    id: 'video-7',
    moduleNumber: 7,
    title: 'Gestao Durante a Live',
    duration: '8-12 min',
    icon: Users,
    gradient: 'from-indigo-400 to-blue-500',
    description: 'Multitarefas, trabalho em equipe e gestao em tempo real',
    videoUrl: null,
    topics: [
      'Respondendo comentarios',
      'Adicionando produtos dinamicamente',
      'Acompanhando vendas em tempo real',
      'Ajustando ofertas',
      'Monitorando problemas tecnicos',
      'Comunicacao com moderador',
      'Sinais e codigos internos',
      'Quando pedir ajuda',
    ],
    content: `# Gestao Durante a Live

## Multitarefas Essenciais

### Respondendo Comentarios
- Monitore o chat constantemente
- Priorize perguntas sobre produtos
- Agradeca novos seguidores
- Responda com simpatia

### Adicionando Produtos Dinamicamente
- Adicione produtos solicitados
- Remova itens esgotados
- Reordene conforme demanda
- Destaque mais vendidos

### Acompanhando Vendas
- Monitore painel de vendas
- Celebre marcos ("Ja vendemos 100!")
- Ajuste estrategia se necessario
- Identifique produtos quentes

### Ajustando Ofertas
- Crie ofertas flash se vendas baixas
- Aumente desconto para desovar estoque
- Combine produtos em kits
- Reative cupons

### Monitorando Problemas Tecnicos
- Verifique qualidade do video
- Monitore audio
- Observe conexao
- Tenha plano B pronto

## Trabalho em Equipe

### Com Moderador/Assistente
- Divisao clara de tarefas
- Comunicacao constante
- Suporte mutuo

### Sinais e Codigos Internos
- "Verificar estoque" = produto acabando
- "Chamar suporte" = problema tecnico
- "Intervalo" = pausa necessaria

### Quando Pedir Ajuda
- Problemas tecnicos graves
- Duvidas sobre politicas
- Clientes muito insatisfeitos
- Situacoes incomuns`,
  },
  {
    id: 'video-8',
    moduleNumber: 8,
    title: 'Pos-Live e Metricas',
    duration: '8-10 min',
    icon: BarChart3,
    gradient: 'from-cyan-400 to-teal-500',
    description: 'Finalizacao, analise de metricas e relatorios',
    videoUrl: null,
    topics: [
      'Checklist de encerramento',
      'Salvando relatorio',
      'Registrando vendas',
      'Analise de visualizacoes',
      'Taxa de conversao',
      'Produtos mais vendidos',
      'Tempo medio de permanencia',
      'Preenchendo planilhas e relatorios',
    ],
    content: `# Pos-Live e Metricas

## Finalizando a Live

### Checklist de Encerramento
- [ ] Agradecer audiencia
- [ ] Lembrar de finalizar compras
- [ ] Anunciar proxima live
- [ ] Encerrar transmissao pelo app
- [ ] Salvar relatorio
- [ ] Atualizar estoque

### Salvando Relatorio
1. Acesse historico de lives
2. Selecione a live realizada
3. Exporte dados
4. Salve na pasta compartilhada

### Registrando Vendas
- Anote total de vendas
- Liste produtos vendidos
- Registre valores
- Compare com meta

## Analise Basica de Metricas

### Visualizacoes
- Total de espectadores
- Pico de audiencia
- Horario de maior engajamento
- Origem dos espectadores

### Taxa de Conversao
- Formula: (Vendas / Visualizacoes) x 100
- Meta minima: 3-5%
- Boa performance: 8-12%
- Excelente: acima de 15%

### Produtos Mais Vendidos
- Identifique top 5
- Analise motivos do sucesso
- Replique estrategia

### Tempo Medio de Permanencia
- Quanto tempo ficaram assistindo
- Momentos de queda
- O que funcionou

## Preenchendo Planilhas

### Relatorio Diario
| Campo | O que preencher |
|-------|----------------|
| Data | Data da live |
| Duracao | Tempo total |
| Visualizacoes | Total |
| Vendas | Quantidade |
| Faturamento | Valor total |
| Conversao | Percentual |

### Controle de Estoque
- Atualize produtos vendidos
- Sinalize itens zerados
- Solicite reposicao`,
  },
  {
    id: 'video-9',
    moduleNumber: 9,
    title: 'Problemas Comuns e Solucoes',
    duration: '8-10 min',
    icon: AlertTriangle,
    gradient: 'from-orange-400 to-red-500',
    description: 'Troubleshooting rapido e resolucao de problemas',
    videoUrl: null,
    topics: [
      'Internet caiu - o que fazer?',
      'App travou - solucoes',
      'Produto acabou durante a live',
      'Cliente insatisfeito nos comentarios',
      'Problemas tecnicos (som, imagem)',
      'Quando escalar para supervisao',
    ],
    content: `# Problemas Comuns e Solucoes

## Troubleshooting Rapido

### Internet Caiu
**Sintomas:** Video travando, desconexao

**Solucoes:**
1. Mantenha calma
2. Verifique roteador
3. Tente reconectar
4. Use dados moveis como backup
5. Avise audiencia se voltar
6. Se nao resolver em 5min, cancele

### App Travou
**Sintomas:** App nao responde, tela preta

**Solucoes:**
1. Force fechamento do app
2. Reabra rapidamente
3. Verifique se live continua
4. Reconecte se necessario
5. Peca desculpas a audiencia

### Produto Acabou Durante a Live
**Sintomas:** Estoque zerou, cliente quer comprar

**Solucoes:**
1. Informe imediatamente
2. Ofereca alternativa similar
3. Crie lista de espera
4. Prometa reposicao
5. Oferca cupom como compensacao

### Cliente Insatisfeito nos Comentarios
**Sintomas:** Reclamacoes, comentarios negativos

**Solucoes:**
1. Nao ignore
2. Responda com educacao
3. Ofereca suporte privado
4. Nao discuta publicamente
5. Encaminhe para SAC se grave

### Problemas de Som
**Sintomas:** Audio baixo, eco, ruido

**Solucoes:**
1. Verifique microfone
2. Ajuste volume no app
3. Afaste de fontes de ruido
4. Use fone com microfone
5. Reinicie se persistir

### Problemas de Imagem
**Sintomas:** Video escuro, borrado, travando

**Solucoes:**
1. Melhore iluminacao
2. Limpe camera
3. Reduza qualidade se internet lenta
4. Reinicie app
5. Verifique configuracoes

## Quando Escalar para Supervisao

### Escale Imediatamente Se:
- Problemas tecnicos graves (+ de 10min)
- Cliente ameacando processo
- Duvidas sobre politicas da empresa
- Situacao fora do seu controle
- Emergencias pessoais

### Como Escalar
1. Avise audiencia de pausa
2. Contate supervisor (WhatsApp/ligacao)
3. Explique situacao claramente
4. Siga orientacoes
5. Documente ocorrido`,
  },
  {
    id: 'video-10',
    moduleNumber: 10,
    title: 'Pratica Supervisionada',
    duration: '20-30 min',
    icon: UserCheck,
    gradient: 'from-green-400 to-emerald-500',
    description: 'Primeira live com supervisao e feedback em tempo real',
    videoUrl: null,
    topics: [
      'Live de teste supervisionada',
      'Supervisor acompanha e orienta',
      'Feedback em tempo real',
      'Correcoes e ajustes',
      'Avaliacao final',
      'Certificado de conclusao',
    ],
    content: `# Pratica Supervisionada

## Primeira Live com Supervisao

### Preparacao
Antes da pratica:
- Revise todos os modulos
- Prepare roteiro
- Organize produtos
- Teste equipamentos
- Confirme horario com supervisor

### Durante a Pratica

#### O que vai acontecer:
1. Voce conduzira uma live real ou simulada
2. Supervisor observa em tempo real
3. Feedback discreto via chat privado
4. Duracao: 20-30 minutos
5. Todos os elementos serao avaliados

#### Pontos de Avaliacao:
- [ ] Abertura conforme script
- [ ] Apresentacao de produtos
- [ ] Interacao com audiencia
- [ ] Uso de recursos (moedas, sorteios)
- [ ] Gestao de tempo
- [ ] Resolucao de problemas
- [ ] Fechamento adequado

### Feedback e Correcoes

#### Apos a Pratica:
1. Reuniao com supervisor
2. Analise dos pontos fortes
3. Areas de melhoria
4. Plano de acao
5. Duvidas finais

### Criterios de Aprovacao

#### Para ser aprovado:
- Completar todos os 10 modulos
- Realizar pratica supervisionada
- Atingir nota minima de 70%
- Demonstrar competencia basica

### Certificado de Conclusao

Apos aprovacao voce recebera:
- Certificado digital
- Liberacao para operar sozinho
- Acesso a escalas
- Suporte continuo da equipe

---

## PARABENS!

Voce completou o treinamento e esta pronto para iniciar sua jornada como Operador de Lives MegaJu!

Lembre-se:
- Pratique sempre
- Peca feedback
- Evolua continuamente
- Divirta-se!

Boa sorte! 🎉`,
  },
]

export const supportMaterials = [
  {
    id: 'material-1',
    title: 'Checklist Pre-Live',
    description: 'Lista completa para verificar antes de cada transmissao',
    icon: CheckSquare,
    type: 'pdf',
    downloadUrl: '#',
    content: `# CHECKLIST PRE-LIVE

## 30 Minutos Antes
- [ ] Verificar conexao de internet (min 10mbps)
- [ ] Testar camera e enquadramento
- [ ] Testar microfone e audio
- [ ] Organizar produtos na mesa
- [ ] Verificar iluminacao
- [ ] Preparar agua e itens pessoais

## 15 Minutos Antes
- [ ] Login no MegaJu Live
- [ ] Verificar produtos adicionados
- [ ] Conferir precos e estoques
- [ ] Preparar cupons e promocoes
- [ ] Revisar roteiro brevemente
- [ ] Comunicar equipe que esta pronto

## 5 Minutos Antes
- [ ] Fechar outros aplicativos
- [ ] Silenciar notificacoes do celular
- [ ] Ultima verificacao de audio/video
- [ ] Respirar fundo e relaxar
- [ ] Iniciar transmissao!`,
  },
  {
    id: 'material-2',
    title: 'Scripts por Categoria',
    description: 'Roteiros prontos para diferentes tipos de produtos',
    icon: FileText,
    type: 'doc',
    downloadUrl: '#',
    content: `# SCRIPTS POR CATEGORIA

## Moda Feminina
"Olha que LINDO esse vestido, gente!
Tecido super confortavel, caimento perfeito!
Disponivel do P ao GG, serve em todo tipo de corpo!
E o melhor: so R$XX na nossa live!
Corre que ta acabando!"

## Eletronicos
"Esse fone aqui e INCRIVEL!
Bateria de XX horas, som de alta qualidade!
Perfeito pra quem trabalha, estuda ou malha!
Preco de loja: R$XX. Na live: so R$XX!
Quem quer? Comenta EU QUERO!"

## Casa e Decoracao
"Olha esse organizador MARAVILHOSO!
Deixa tudo no lugar, super pratico!
Cabe em qualquer cantinho da casa!
Material resistente, duravel!
Leva 2 e paga menos! Aproveita!"

## Beleza e Cosmeticos
"Gente, OLHA essa cor! Linda demais!
Longa duracao, nao sai com nada!
Hidrata enquanto usa!
Todas as influencers estao usando!
Garanta a sua antes que acabe!"`,
  },
  {
    id: 'material-3',
    title: 'Frases de Impacto',
    description: 'Expressoes e gatilhos para usar durante as lives',
    icon: MessageSquare,
    type: 'doc',
    downloadUrl: '#',
    content: `# FRASES DE IMPACTO

## Criar Urgencia
- "Ultimas unidades, corre!"
- "So ate o fim da live!"
- "Depois volta pro preco normal!"
- "Quem nao comprar vai se arrepender!"
- "Estoque super limitado!"

## Engajar Audiencia
- "Comenta AI se voce quer!"
- "Quem concorda da um like!"
- "Marca aquela amiga que precisa!"
- "Compartilha pra ajudar o canal!"
- "Quem ja comprou? Conta pra gente!"

## Destacar Beneficios
- "Imagina voce usando isso!"
- "Vai mudar sua vida!"
- "Voce MERECE esse presente!"
- "Qualidade premium, preco de outlet!"
- "Igual de marca famosa, metade do preco!"

## Criar Conexao
- "Eu uso e AMO!"
- "Minha mae tem e adora!"
- "Sucesso de vendas na loja!"
- "Todo mundo ta querendo!"
- "Vou revelar um segredo..."

## Fechar Vendas
- "Entao, leva ou nao leva?"
- "Vou contar ate 3 pra decidir!"
- "Quem quer? Comenta QUERO!"
- "Adiciona no carrinho AGORA!"
- "Garante o seu antes que acabe!"`,
  },
  {
    id: 'material-4',
    title: 'Contatos Importantes',
    description: 'Telefones e contatos de suporte, supervisor e TI',
    icon: Phone,
    type: 'doc',
    downloadUrl: '#',
    content: `# CONTATOS IMPORTANTES

## Supervisao
- **Supervisor de Lives**
  - WhatsApp: (XX) XXXXX-XXXX
  - Horario: 8h as 22h

## Suporte Tecnico
- **TI - Problemas de Sistema**
  - WhatsApp: (XX) XXXXX-XXXX
  - Email: ti@empresa.com
  - Horario: 8h as 18h

## Suporte MegaJu
- **Central de Ajuda Seller**
  - Chat no app
  - 0800 XXX XXXX
  - 24 horas

## Emergencias
- **Gerente de Plantao**
  - WhatsApp: (XX) XXXXX-XXXX
  - Apenas emergencias!

## Grupo da Equipe
- **WhatsApp Lives**
  - Link: [solicitar ao supervisor]
  - Duvidas rapidas
  - Avisos gerais`,
  },
  {
    id: 'material-5',
    title: 'FAQ - Perguntas Frequentes',
    description: 'Respostas para duvidas comuns de clientes',
    icon: HelpCircle,
    type: 'doc',
    downloadUrl: '#',
    content: `# FAQ - PERGUNTAS FREQUENTES

## Sobre Produtos

**"Tem na cor X?"**
"Deixa eu verificar o estoque... [verificar] Sim/Nao, temos disponivel em [cores]. Qual voce prefere?"

**"Qual o tamanho?"**
"As medidas sao: [informar]. Posso te ajudar a escolher o ideal?"

**"E original?"**
"Sim! Todos nossos produtos sao originais com nota fiscal e garantia!"

## Sobre Entrega

**"Quanto tempo demora?"**
"O prazo depende da sua regiao. Geralmente de X a Y dias uteis. Coloca seu CEP no carrinho pra ver certinho!"

**"Tem frete gratis?"**
"Compras acima de R$XX tem frete gratis! Aproveita e leva mais!"

## Sobre Pagamento

**"Posso parcelar?"**
"Sim! Parcelamos em ate Xx sem juros no cartao!"

**"Aceita PIX?"**
"Aceita sim! E ainda tem X% de desconto!"

## Sobre Trocas

**"Posso trocar se nao servir?"**
"Claro! Voce tem X dias pra trocar. Sem burocracia!"

**"Como faco pra devolver?"**
"E so abrir um chamado no app. Super facil e sem custo!"`,
  },
  {
    id: 'material-6',
    title: 'Politica de Trocas',
    description: 'Regras e procedimentos para trocas e devolucoes',
    icon: RefreshCw,
    type: 'pdf',
    downloadUrl: '#',
    content: `# POLITICA DE TROCAS E DEVOLUCOES

## Prazo para Solicitacao
- **7 dias** apos recebimento para arrependimento
- **30 dias** para defeito de fabricacao

## Como Solicitar
1. Cliente abre chamado no app MegaJu
2. Seleciona motivo da devolucao
3. Aguarda aprovacao
4. Envia produto de volta
5. Recebe reembolso ou novo produto

## Condicoes para Troca
- Produto sem uso
- Com etiquetas originais
- Na embalagem original
- Sem danos causados pelo cliente

## O Que NAO Pode Trocar
- Produtos de higiene pessoal abertos
- Roupas intimas
- Produtos personalizados
- Itens em promocao final (verificar)

## Reembolso
- PIX: ate 3 dias uteis
- Cartao: ate 2 faturas
- Saldo MegaJu: imediato

## Durante a Live
Se cliente perguntar sobre trocas:
"Voce tem X dias pra trocar tranquilamente! A MegaJu protege sua compra!"`,
  },
]

export const trainingInfo = {
  totalVideoDuration: '1h30 a 2h',
  practicalDuration: '30-40 min',
  totalDuration: '~2h30',
  certificateEnabled: true,
  passingScore: 70,
}

# 📘 Manual do Sistema: Shopee Live Manager

Bem-vindo ao sistema de **Gestão e Analytics para Lives Shopee**. Este manual serve como guia passo-a-passo para instalar, rodar e utilizar o sistema.

---

## 🚀 1. Como Iniciar o Sistema (Modo Rápido)

Para facilitar o uso, criamos um script de inicialização automática.

1.  Navegue até a pasta do projeto: `c:\xampp\htdocs\Megaju\Live\shopee-live-system`
2.  Encontre o arquivo chamado **`start.bat`**.
3.  Dê um **duplo clique** nele.
4.  Duas janelas pretas (terminais) irão abrir. **Não as feche!** Elas mantêm o sistema rodando.
5.  Seu navegador padrão deve abrir automaticamente no endereço: `http://localhost:5173`

> **Nota:** Se o navegador não abrir, digite manualmente `http://localhost:5173` na barra de endereços.

---

## 🔑 2. Acesso ao Sistema

Use as credenciais abaixo para entrar (ou crie uma nova conta clicando em "Registrar"):

*   **Email:** `colaborador@shopee.com`
*   **Senha:** `collab123`

---

## 📹 3. Fluxo de Trabalho (Passo a Passo)

### Passo A: Iniciar uma Live
1.  No **Dashboard**, você verá um botão grande vermelho: **"INICIAR NOVA LIVE"**.
2.  Clique nele.
3.  Preencha os dados iniciais obrigatórios:
    *   **Seguidores Atuais:** Número exato de seguidores na Shopee antes de começar.
    *   **Saldo de Moedas:** Quantidade de moedas disponíveis para gastar.
4.  Clique em **"Começar Transmissão"**.
5.  O status mudará para `AO VIVO`.

### Passo B: Durante a Live (Painel de Controle)
Enquanto você transmite, mantenha a janela do sistema aberta. Você pode registrar métricas em tempo real:
*   **Pico de Espectadores:** Atualize sempre que bater um novo recorde.
*   **Anotações:** Escreva lembretes ou acontecimentos importantes no campo de texto.
*   O sistema salva essas alterações automaticamente a cada 2 segundos.

### Passo C: Finalizar a Live
Quando encerrar a transmissão na Shopee:
1.  No sistema, clique em **"Finalizar Live"**.
2.  Preencha os dados finais:
    *   **Seguidores Finais:** Para calcular quantos ganhou.
    *   **Saldo Final de Moedas:** Para calcular o gasto.
3.  **Importante (IA):** Tire um **Print (Screenshot)** da tela de resumo da Shopee App e faça o upload no campo indicado.
    *   O sistema usará Inteligência Artificial para ler esse print e salvar automaticamente: Vendas, Receita, Likes e Views.
4.  Clique em **"Salvar e Gerar Relatório"**.

---

## 📊 4. Analytics e Histórico

No menu lateral, clique em **Histórico**:
*   Você verá uma tabela com todas as lives já feitas.
*   Colunas importantes:
    *   **ROI (Retorno sobre Investimento):** Calcula o lucro gerado para cada moeda gasta. (Fórmula: `(Receita - Custo Moedas) / Custo Moedas`).
    *   **Custo:** Valor estimado gasto em moedas.
    *   **Receita:** Valor total vendido.

---

## 🛠️ 5. Resolução de Problemas (Troubleshooting)

### O sistema não abre ou dá erro de conexão
1.  Verifique se as **duas** janelas pretas (terminais) estão abertas.
2.  Se fecharam sozinhas, houve um erro. Tente rodar o `start.bat` novamente.
3.  Se o erro persistir, abra a pasta `server` e `client` manualmente e digite `npm install` para garantir que tudo foi instalado.

### O upload do Print/Screenshot dá erro
1.  A imagem deve ser **PNG** ou **JPG**.
2.  O tamanho máximo é 5MB.
3.  Se a IA falhar ao ler, você pode editar os valores manualmente depois no histórico (em breve).

### "Erro de Dependências"
Se aparecer mensagens sobre módulos faltando (`Cannot find module...`):
1.  Abra um terminal na pasta do projeto.
2.  Execute:
    ```powershell
    cd server; npm install
    cd ../client; npm install
    ```
3.  Tente rodar o `start.bat` de novo.

---

## 📞 Suporte
Para dúvidas técnicas ou erros, entre em contato com o desenvolvedor responsável.

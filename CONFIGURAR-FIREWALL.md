# 🔥 Como Configurar o Firewall do Windows

## Método 1: PowerShell (Mais Rápido) ⚡

Abra o PowerShell **como Administrador** e execute:

```powershell
New-NetFirewallRule -DisplayName "MegaJu Live Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

✅ Pronto! Porta 5000 liberada!

---

## Método 2: Interface Gráfica (Passo a Passo) 🖱️

1. Abra o menu Iniciar → digite **"Firewall"**
2. Clique em **"Firewall do Windows Defender com Segurança Avançada"**
3. Clique em **"Regras de Entrada"** (painel esquerdo)
4. Clique em **"Nova Regra..."** (painel direito)
5. Selecione **"Porta"** → Próximo
6. **TCP** → **Portas locais específicas:** `5000` → Próximo
7. **Permitir a conexão** → Próximo
8. Marque **Domínio, Particular e Público** → Próximo
9. Nome: **MegaJu Live Server** → Concluir

✅ Regra criada com sucesso!

---

## Verificar se a regra foi criada

```powershell
Get-NetFirewallRule -DisplayName "MegaJu Live Server"
```

Se aparecer a regra, está tudo certo!

---

## Remover a regra (se necessário)

```powershell
Remove-NetFirewallRule -DisplayName "MegaJu Live Server"
```

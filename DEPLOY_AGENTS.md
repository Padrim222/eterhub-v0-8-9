# 🚀 Guia de Deploy - EterHub Agent Pipeline

Este guia explica como ativar o sistema de agentes de IA do EterHub.

## ✅ O que foi implementado

1. **Edge Function `run-agent`**: Uma função segura no servidor que processa cada agente da pipeline
2. **Remoção de API key do frontend**: A chave da OpenRouter foi movida para os secrets do Supabase
3. **Integração com FlowBuilder**: O frontend agora chama a Edge Function em vez de fazer requisições diretas

---

## 📋 Passo a Passo para Ativar

### 1. Login no Supabase CLI

```powershell
# No terminal, execute:
npx supabase login
```

Isso abrirá um navegador para você fazer login com sua conta Supabase.

### 2. Deploy da Edge Function

```powershell
# Faça o deploy da função run-agent:
npx supabase functions deploy run-agent --project-ref kzozelpatwzdrmtnsnte
```

### 3. Configurar API Key (OBRIGATÓRIO!)

Acesse: [Dashboard Supabase](https://supabase.com/dashboard/project/kzozelpatwzdrmtnsnte/settings/functions)

1. Vá em **Project Settings** → **Edge Functions** → **Secrets**
2. Adicione um novo secret:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `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`

> 💡 Você também pode usar `OPENAI_API_KEY` se preferir usar a OpenAI diretamente.

### 4. Testar a Aplicação

```powershell
# Inicie o servidor de desenvolvimento:
npm run dev
```

1. Acesse a página **Eterflow** 
2. Clique em **Template** para carregar o pipeline de 5 agentes
3. Clique em **Executar Pipeline**
4. Cada agente com "Touchpoint" ativado vai pausar para sua aprovação

---

## 🎯 Como Funciona o Pipeline

```
┌─────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────┐
│ Trigger │ → │   Fonte    │ → │ 1.Observer │ → │2.Strategist│ → │3.Researcher│ → │ 4.Architect│ → │5.Copywriter │
│  Start  │   │  de Dados  │   │  (Análise) │   │ (Ideação)  │   │ (Pesquisa) │   │ (Estrutura)│   │   (Texto)   │
└─────────┘   └────────────┘   └────────────┘   └─────┬──────┘   └────────────┘   └─────┬──────┘   └──────┬──────┘
                                                      │                                  │                 │
                                                      │ TOUCHPOINT                       │ TOUCHPOINT      │ TOUCHPOINT
                                                      │ (Aprovar temas)                  │ (Aprovar        │ (Aprovar
                                                      ▼                                  ▼  estrutura)     ▼  texto final)
```

### Touchpoints (Pontos de Aprovação Humana)
- **Strategist**: Você revisa e aprova quais temas/ideias serão desenvolvidos
- **Architect**: Você revisa e aprova a estrutura narrativa (roteiro)
- **Copywriter**: Você revisa e aprova o texto final antes de publicar

---

## 🔧 Troubleshooting

### "Função não encontrada"
Execute o deploy novamente:
```powershell
npx supabase functions deploy run-agent --project-ref kzozelpatwzdrmtnsnte
```

### "Nenhuma API key encontrada"
Configure a OPENROUTER_API_KEY nos secrets do Supabase (passo 3).

### "Access Control Error"
Faça login no Supabase CLI:
```powershell
npx supabase login
```

---

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/run-agent/index.ts` | **NOVO** - Edge Function para execução segura de agentes |
| `src/components/eterflow/FlowBuilder.tsx` | Atualizado para usar Edge Function |
| `supabase/config.toml` | Adicionada configuração da run-agent |
| `.env` | Removida API key exposta (segurança) |

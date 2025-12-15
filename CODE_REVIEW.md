# Code Review Report

## 1. Dados Mockados (Mock Data)

### Lógica "Fake" no Dashboard (Crítico)
O arquivo `src/pages/Imovi.tsx` contém lógica de negócio simulada que **não reflete dados reais**, mesmo que pareça estar usando métricas do banco.
- **Taxa de Conversão**: Calculada arbitrariamente como `50%` da taxa de qualificação (`* 0.5`).
- **Número de Vendas**: Calculado arbitrariamente como `30%` dos leads qualificados (`* 0.3`).
- **Problema**: Se o cliente olhar esses números, eles estarão errados/inventados, pois não existe uma tabela de `sales` ou integração ativa de vendas sendo consultada nessas linhas.

```typescript
// src/pages/Imovi.tsx lines 60-63
const conversionRate = totalLeads > 0 ? (totalQualified / totalLeads) * 100 * 0.5 : 0;
const totalSales = Math.floor(totalQualified * 0.3);
```

### Script de População de Dados
O arquivo `populate-test-user-data.sql` insere dados fictícios (posts do Instagram, métricas) para o usuário `brufab222@gmail.com`.
- Isso é útil para desenvolvimento, mas deve-se ter cuidado para não rodar em produção e sobrescrever dados reais de usuários, pois contém comandos `DELETE FROM public.ig_posts`.

### Placeholders Visuais
- **IMOVI Card (`IMOVICard.tsx`)**: Se não houver histórico de IMOVI, ele gera um array de 8 meses com valor zero. Isso é um comportamento de fallback aceitável, mas visualmente mostra "dados vazios".

---

## 2. Códigos "Velhos" ou Suspeitos (Legacy/Todo)

### Comentários em Hooks
No arquivo `src/hooks/useLeadsData.ts`, há um comentário explícito indicando remoção de dados antigos:
```typescript
// Dados removidos - usando dados reais do banco
```
Isso é bom (indica refatoração), mas mostra que o código passou por mudanças recentes de "mock" para "real".

### Ausência de Tabela de Vendas
O código do frontend (`Imovi.tsx`) tenta mostrar "Vendas", mas não encontrei nenhum arquivo `.sql` criando uma tabela `sales` ou `orders`. Isso confirma que a parte de Vendas é inteiramente "fumaça" no momento.

---

## 3. Sugestões de Correção

1.  **Remover Lógica Fake**: Substituir o cálculo de `conversionRate` e `totalSales` em `Imovi.tsx`. Se os dados não existem, mostre "0" ou "N/A" ou esconda os cards, ao invés de inventar um número baseado em porcentagem fixa.
2.  **Criar Tabela de Vendas**: Se a intenção é mostrar vendas reais, criar a tabela `public.sales` e o hook correspondente (`useSalesData`).
3.  **Limpeza**: O arquivo `populate-test-user-data.sql` deve ser mantido apenas se for explicitamente para ambiente de DEV.

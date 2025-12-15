# Project Context: Eterhub

## 1. Visão Geral do Projeto
**Nome**: Eterhub (v0.8.9)
**Descrição**: Uma plataforma robusta de dashboard e CRM, focada em marketing e gestão de leads, com forte viés para automação e integração (Eterflow). O sistema é construído com uma abordagem mobile-first, utilizando tecnologias modernas de frontend e Supabase como backend.
**Objetivo Principal**: Gerenciamento de campanhas, monitoramento de leads, segmentação por ICPs (Ideal Customer Profiles) e integrações com ferramentas externas via webhooks (n8n, Pipedrive, Reportei).

---

## 2. Tech Stack

### Frontend Core
- **Framework**: [React](https://react.dev/) (v18.3.1)
- **Build Tool**: [Vite](https://vitejs.dev/) (v7.2.7)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (v5.8.3)
- **Roteamento**: [React Router DOM](https://reactrouter.com/) (v6.30.1)
- **Gerenciamento de Estado/Cache**: [TanStack Query v5](https://tanstack.com/query/v5) (React Query)

### UI & UX
- **Design System/Componentes**: [Shadcn UI](https://ui.shadcn.com/) (baseado em Radix UI)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (v3.4.17) com plugin `tailwindcss-animate`
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Feedback Visual**: `sonner` (toasts), `vaul` (drawers mobile-friendly)

### Backend & Database (BaaS)
- **Plataforma**: [Supabase](https://supabase.com/)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL
- **Segurança**: RLS (Row Level Security) ativado em todas as tabelas
- **Client**: `@supabase/supabase-js`

### Ferramentas de Desenvolvimento
- **Linting**: ESLint (v9.32.0)
- **Gerenciador de Pacotes**: npm ou bun (baseado na presença de `bun.lockb` e `package-lock.json`)

---

## 3. Estrutura de Banco de Dados (Schema)

O banco de dados utiliza PostgreSQL hospedado no Supabase. Todas as tabelas possuem RLS habilitado, garantindo que usuários acessem apenas seus próprios dados.

### `public.campaigns`
Armazena as campanhas de marketing criadas pelos usuários.
- `id`: UUID (PK)
- `user_id`: UUID (FK -> auth.users)
- `name`: TEXT (Nome da campanha)
- `color`: TEXT (Cor para identificação visual)
- `created_at`, `updated_at`: TIMESTAMPTZ

### `public.campaign_data`
Armazena métricas diárias das campanhas (Série Temporal).
- `id`: UUID (PK)
- `campaign_id`: UUID (FK -> public.campaigns)
- `date`: DATE
- `leads_count`: INTEGER (Número de leads capturados no dia)
- `created_at`: TIMESTAMPTZ
- **Constraint**: Unique(`campaign_id`, `date`)

### `public.leads`
Tabela central de leads.
- `id`: UUID (PK)
- `user_id`: UUID (FK -> auth.users)
- `icp_id`: UUID (FK -> public.icps) - Segmentação do lead
- `name`, `email`, `phone`: TEXT
- `source_channel`: TEXT (Origem do lead)
- `income`: NUMERIC (Renda)
- `qualification_score`: NUMERIC
- `engagement_score`: NUMERIC
- `lead_score`: NUMERIC
- `is_qualified`: BOOLEAN
- `position`: INTEGER
- `metadata`: JSONB (Dados flexíveis adicionais)

### `public.icps` (Ideal Customer Profiles)
Perfis de cliente ideal para segmentação.
- `id`: UUID (PK)
- `user_id`: UUID (FK -> auth.users)
- `name`: TEXT (Ex: "Investidor", "Primeiro Imóvel")
- `color`: TEXT
- `criteria`: JSONB (Critérios de segmentação)
- `position`: INTEGER (Ordenação)

### `public.user_settings`
Configurações e integrações personalizadas do usuário.
- `id`: UUID (PK)
- `user_id`: UUID (FK -> auth.users, Unique)
- `n8n_reportei_webhook`: TEXT (URL do webhook)
- `n8n_pipedrive_webhook`: TEXT (URL do webhook)
- `reportei_update_frequency`: INTEGER (Default: 6h)

---

## 4. Design System & Identidade Visual

### Paleta de Cores (HSL)
As cores são definidas no `src/index.css` via variáveis CSS e mapeadas no `tailwind.config.ts`.
- **Tema**: Predominantemente Dark Mode.
- **Primary / Ring / Accent**: `hsl(120 83% 58%)` (Verde vibrante / Neon Green)
  - Usado para destaques, botões de ação principal, e elementos ativos na sidebar.
- **Background**: `hsl(0 0% 0%)` (Preto absoluto)
- **Card**: `hsl(0 0% 8%)` a `hsl(0 0% 4%)` (Cinza muito escuro)
- **Destructive**: Vermelho (`hsl(0 62.8% 30.6%)` no dark mode)

### Tipografia
- **Família**: Inter (`font-sans`)
- **Escala**: O projeto define classes utilitárias para hierarquia de texto mobile (`.mobile-h1`, `.mobile-h2`, etc.).

### Mobile-First & Acessibilidade
O arquivo CSS global define regras estritas para UX mobile:
- **Touch Targets**: `.touch-target` (min 44px) e `.touch-target-lg` (min 56px).
- **Interface Adaptativa**: Breakpoints para esconder/mostrar elementos (`.hide-mobile`, `.show-mobile`) e ajustes de padding (`.container`, `.card-mobile`).
- **Animações**: Uso sutil de `accordion-down` e `accordion-up` para menus expansíveis.

---

## 5. Estrutura de Diretórios (`src/`)

- `components/`: Componentes React.
  - `ui/`: Componentes base do Shadcn (Buttons, Inputs, Dialogs, etc).
  - `admin/`, `canais/`, `consultoria/`, `dashboard/`, `eterflow/`, `leads/`, `layout/`: Componentes específicos por domínio.
- `pages/`: Componentes de Página (Views).
  - `Home.tsx` (Renderiza `Imovi.tsx`)
  - `Auth.tsx`, `Admin.tsx`, `CentralCliente.tsx`, `Configuracoes.tsx`, `Conteudo.tsx`, `Eterflow.tsx`, `Integracoes.tsx`, `Leads.tsx`.
- `hooks/`: Custom Hooks (ex: possivelmente `use-toast.ts`, hooks de API).
- `integrations/`: Definições e clientes de API (Supabase).
- `lib/`: Utilitários (ex: `utils.ts` para cn/clsx).

---

## 6. Lógica de Negócio e Funcionalidades

### Autenticação & Permissões
- O acesso é restrito via `Supabase Auth`.
- Rotas protegidas (embora não explicitamente visto um wrapper de `PrivateRoute` no `App.tsx`, o RLS no banco impede acesso a dados sem login).

### Integrações (Eterflow)
- O sistema atua como um hub para conectar ferramentas de marketing.
- **n8n**: Webhooks configuráveis para automação de fluxos.
- **Pipes (Pipedrive)**: Integração via webhook.
- **Reportei**: Integração para relatórios.

### Dashboard (Imovi)
- Página principal (`/home`) focada em visualização de dados.
- Renderiza componentes do diretório `dashboard` e `consultoria`.
- Provavelmente exibe gráficos de leads, performance de campanhas e métricas financeiras.

### Gestão de Leads
- Captura, qualificação e organização de leads.
- Leads são classificados visualmente com scores e associados a ICPs coloridos.

### Admin
- Área administrativa (`/admin`) para gestão mais avançada, possivelmente gerenciamento de usuários ou configurações globais do sistema.

---

## 7. Regras de Desenvolvimento
1.  **Mobile First**: Sempre priorizar a experiência em telas de 360px. Usar classes `.touch-target` para interatividade.
2.  **UI Consistency**: Usar componentes do Shadcn UI em `components/ui` ao invés de criar HTML puro.
3.  **State Management**: Usar React Query para data fetching. Evitar `useEffect` para chamadas de API.
4.  **Styling**: Usar classes utilitárias do Tailwind. Cores devem seguir as variáveis CSS (ex: `bg-primary`, `text-primary-foreground`).
5.  **Icons**: Usar `lucide-react` para consistência visual.

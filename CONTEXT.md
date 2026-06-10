# CONTEXT.md — formulario-recrutamento

> Gerado em 2026-06-10. Leia os arquivos fonte para estado atual do código.

---

## 1. Stack & Tecnologias

### Linguagem e versão
- **JavaScript (ESM)** — sem TypeScript. `"type": "module"` no package.json.

### Framework principal
- **React 18.3.1** — SPA pura, sem React Router. Navegação controlada por `useState` no `App.jsx`.

### Build
- **Vite 6.0.5** com plugin `@vitejs/plugin-react`
- Comandos: `npm run dev` (dev server), `npm run build` (dist/), `npm run preview`

### CSS
- **Tailwind CSS 3.4.17** com tema customizado em `tailwind.config.js`
- Componentes Tailwind customizados definidos em `src/index.css` via `@layer components`

### Dependências de produção

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | 18.3.1 | Framework UI |
| react-dom | 18.3.1 | Renderização DOM |
| @supabase/supabase-js | 2.47.10 | Cliente Supabase (DB + RLS) |
| @emailjs/browser | 4.4.1 | Envio de email client-side |

### DevDependencies

| Pacote | Versão | Uso |
|--------|--------|-----|
| vite | 6.0.5 | Build tool / dev server |
| @vitejs/plugin-react | 4.3.4 | Plugin Vite para React (Babel) |
| tailwindcss | 3.4.17 | CSS utility-first |
| postcss | 8.4.49 | Processamento CSS |
| autoprefixer | 10.4.20 | Prefixos vendor automáticos |

### Sem ferramentas de teste ou lint configuradas
Não há `eslint`, `jest`, `vitest`, ou qualquer ferramenta de teste no projeto.

---

## 2. Banco de Dados

### Tipo e plataforma
- **PostgreSQL** hospedado no **Supabase** (BaaS)
- Acesso **direto do client-side** via `@supabase/supabase-js` com anon key

### Client utilizado
`src/lib/supabase.js` — cria o cliente com `createClient(url, anonKey)`. Retorna `null` se as env vars não estiverem configuradas. `assertSupabase()` lança erro caso o cliente não exista.

### Tabelas

#### `public.job_requisitions`

| Coluna | Tipo | Constraint | Descrição |
|--------|------|-----------|-----------|
| `id` | `uuid` | PK, `gen_random_uuid()` | Identificador único |
| `created_at` | `timestamptz` | NOT NULL, `now()` | Timestamp de criação |
| `status` | `text` | NOT NULL, default `'pending_hr_review'` | Status da requisição |
| `area` | `text` | nullable | Departamento/setor |
| `cargo` | `text` | nullable | Título do cargo |
| `motivo` | `text` | nullable | `substituicao` \| `aumento_quadro` \| `nova_posicao` |
| `justificativa_vaga` | `text` | nullable | Justificativa detalhada |
| `data_limite` | `date` | nullable | Prazo para contratação |
| `nome_solicitante` | `text` | nullable | Nome do gestor (migration v2) |
| `vale_transporte` | `text` | nullable | Valor máximo do VT em R$ (migration v2) |
| `resumo_responsabilidades` | `text` | nullable | Seção 2 |
| `desafios_reais` | `text` | nullable | Seção 2 |
| `hard_skills_obrigatorios` | `text` | nullable | Seção 3 |
| `hard_skills_desejaveis` | `text` | nullable | Seção 3 |
| `soft_skills` | `text` | nullable | Seção 3 |
| `fatores_eliminatorios` | `text` | nullable | Seção 3 — dealbreakers |
| `cenario_pratico` | `text` | nullable | Seção 4 — para entrevista |
| `gabarito_rh` | `text` | nullable | Seção 4 — gabarito RH |
| `proposta_valor` | `text` | nullable | Seção 5 |

**Índice:** `idx_job_requisitions_status` em `(status)`.

### Migrations

O arquivo `supabase_schema.sql` serve como schema + migrations inline:
- **v1 (comentado):** `add column if not exists justificativa_vaga text`
- **v2 (ativo):** `add column if not exists nome_solicitante text, add column if not exists vale_transporte text`

As migrations v1 e v2 ficam no final do arquivo `supabase_schema.sql`. Execute no SQL Editor do Supabase.

### RLS Policies

| Policy | Operação | Role | Condição |
|--------|----------|------|---------|
| "Allow anonymous inserts" | INSERT | `anon` | `with check (true)` — qualquer um pode inserir |
| "Allow authenticated reads" | SELECT | `authenticated` | `using (true)` — apenas usuários logados leem |

**Atenção:** Não há políticas de UPDATE ou DELETE. Qualquer operação de update/delete feita pelo client anon vai falhar silenciosamente no Supabase a menos que o RLS seja desabilitado ou uma policy adicional seja criada.

---

## 3. Arquitetura & Estrutura

### Estrutura de pastas

```
formulario-recrutamento/
├── index.html                  # Entry point HTML (Vite)
├── vite.config.js              # Configuração Vite (apenas plugin react)
├── tailwind.config.js          # Tema customizado (cores, fontes)
├── postcss.config.js           # Tailwind + autoprefixer
├── package.json
├── supabase_schema.sql         # Schema completo + migrations — rodar no Supabase
│
└── src/
    ├── main.jsx                # Ponto de entrada React — monta <App /> no #root
    ├── App.jsx                 # Shell da aplicação — roteamento por state, layout
    ├── index.css               # Tailwind base/components/utilities + estilos print
    │
    ├── components/
    │   ├── Sidebar.jsx         # Navegação lateral (desktop fixed, mobile overlay)
    │   ├── JobRequisitionForm.jsx  # Formulário de criação/edição (componente central)
    │   ├── BancoDeVagas.jsx    # Listagem de requisições com ações CRUD
    │   └── PrintView.jsx       # Layout de impressão — dispara window.print() via useEffect
    │
    └── lib/
        ├── constants.js        # AREAS, MOTIVO_LABELS, STATUS_CONFIG, FORM_INITIAL
        ├── supabase.js         # createClient + assertSupabase()
        └── email.js            # emailjsConfigured() + sendRequisitionEmail(form)
```

### Padrão arquitetural
**SPA React sem router.** Navegação controlada por `view` state no `App.jsx`:
- `'nova'` → renderiza `<JobRequisitionForm />`
- `'banco'` → renderiza `<BancoDeVagas />`

Estado de `editRecord` e `printRecord` também vive no `App.jsx` e é passado como props.

### Separação de responsabilidades
- **UI / Apresentação:** `src/components/`
- **Lógica de dados / side effects:** inline nos componentes (sem camada de serviço separada)
- **Clientes externos:** `src/lib/supabase.js` e `src/lib/email.js`
- **Dados estáticos:** `src/lib/constants.js`

Não há Context API, Redux, Zustand, ou qualquer gerenciador de estado global.

---

## 4. Módulos & Funcionalidades

### Funcionalidades implementadas

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Formulário de criação | Completo | 5 seções, INSERT no Supabase + email |
| Edição de requisição | Completo | Popula form com dados existentes, UPDATE no Supabase |
| Listagem (Banco de Vagas) | Completo | Grid responsivo com cards, fetch de todos os registros |
| Exclusão de requisição | Completo | Confirmação inline no card, DELETE no Supabase |
| Impressão / PDF | Completo | `PrintView.jsx` com layout dedicado, `window.print()` |
| Notificação por email | Completo | EmailJS — enviado apenas na criação, não na edição |
| Sidebar responsiva | Completo | Fixed no desktop, overlay no mobile, fecha com ESC |
| Toast de feedback | Completo | Sucesso, aviso (EmailJS não configurado), atualização |

### Rotas
Não há rotas no sentido tradicional. A "navegação" é feita via `setView()` no `App.jsx`. Não há URLs distintas para cada tela.

### Operações Supabase por componente

| Componente | Operação | Tabela |
|-----------|----------|--------|
| `JobRequisitionForm.jsx` | `insert` | `job_requisitions` |
| `JobRequisitionForm.jsx` | `update` (por `id`) | `job_requisitions` |
| `BancoDeVagas.jsx` | `select * order by created_at desc` | `job_requisitions` |
| `BancoDeVagas.jsx` | `delete` (por `id`) | `job_requisitions` |

---

## 5. Variáveis de Ambiente

Todas as variáveis começam com `VITE_` (prefixo obrigatório do Vite para expor no client-side).

| Variável | Obrigatória | Descrição |
|----------|------------|-----------|
| `VITE_SUPABASE_URL` | **Sim** | URL do projeto Supabase (ex: `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | **Sim** | Chave anônima pública do Supabase |
| `VITE_EMAILJS_SERVICE_ID` | Não* | ID do serviço EmailJS |
| `VITE_EMAILJS_TEMPLATE_ID` | Não* | ID do template EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | Não* | Chave pública EmailJS |

*Se as variáveis do EmailJS não estiverem configuradas, o sistema exibe um toast de aviso mas **continua funcionando** — o email é simplesmente pulado. O Supabase, porém, é obrigatório: sem as vars o app quebra.

Não existe `.env.example` no repositório. Crie um `.env.local` na raiz com as variáveis acima.

---

## 6. Padrões de Código

### Nomenclatura
- **Arquivos de componente:** PascalCase (`JobRequisitionForm.jsx`, `BancoDeVagas.jsx`)
- **Arquivos de lib:** camelCase (`supabase.js`, `email.js`, `constants.js`)
- **Variáveis de estado:** camelCase (`editRecord`, `printRecord`, `sidebarOpen`)
- **Campos do banco:** snake_case (`nome_solicitante`, `hard_skills_obrigatorios`)
- **Classes CSS customizadas:** kebab-case (`field-base`, `section-card`, `field-danger`)

### Como o Supabase é acessado
Sempre via o cliente exportado de `src/lib/supabase.js`. Padrão:
```js
import { supabase, assertSupabase } from '../lib/supabase'
assertSupabase()
const { data, error } = await supabase.from('job_requisitions').select('*')
```

### Como o email é enviado
Apenas em criações novas (não em edições). Padrão:
```js
import { sendRequisitionEmail, emailjsConfigured } from '../lib/email'
await sendRequisitionEmail(form)  // silently skips if not configured
```

### Tema visual
Paleta de cores definida em `tailwind.config.js`:
- `forest` (#03110D) — fundo principal
- `gold` (#A38560) — destaques, bordas de input
- `burgundy` (#390517) — campos críticos (fatores eliminatórios)
- `cream` (#FAF8F3) — texto principal

Fontes via Google Fonts (carregadas no `index.html`): **Cormorant Garamond** (headings) + **Inter** (body).

### Padrão de toast
Gerenciado no `App.jsx` via `toastState` (objeto com `show`, `type`, `message`). Passado como prop para os componentes filhos que chamam `setToastState(...)`.

### Print
`PrintView.jsx` é renderizado condicionalmente no `App.jsx` quando `printRecord !== null`. Usa classes `print:block` / `print:hidden` do Tailwind. O `window.print()` é disparado via `useEffect` com delay de 180ms. O callback `onafterprint` limpa o estado.

---

## 7. O que está pendente / bugs conhecidos

### RLS incompleto (bug potencial)
As políticas RLS definem apenas `INSERT` (anon) e `SELECT` (authenticated). **Não há políticas para `UPDATE` ou `DELETE`.** As operações de edição e exclusão são feitas com o `anon` role, então dependem do RLS estar desabilitado na tabela — o que contradiz o `enable row level security` no schema. **Confirme no Supabase Dashboard se UPDATE/DELETE estão funcionando ou se o RLS foi desabilitado manualmente.**

### Sem paginação
`BancoDeVagas.jsx` faz `select('*')` sem `limit`. Com muitos registros, isso pode se tornar lento.

### Email hardcoded
O destinatário `grupomeeteat@gmail.com` está hardcoded em `src/lib/email.js:53`. Não é configurável via env var.

### Sem validação client-side robusta
Apenas o campo `justificativa_vaga` tem `required` no HTML. Todos os outros campos podem ser submetidos vazios.

### Sem `.env.example`
Não há template de variáveis de ambiente no repositório. Um desenvolvedor novo não sabe quais variáveis configurar sem ler o código.

### Sem feedback de erro em delete
Se o DELETE falhar no Supabase (ex: por RLS), o erro é logado no console mas não exibido na UI para o usuário.

### TODOs no código
Nenhum comentário `TODO` ou `FIXME` encontrado nos arquivos fonte.

### Sem autenticação de usuário
A aplicação assume uso interno irrestrito. Qualquer pessoa com acesso à URL pode criar, editar e deletar requisições. Não há rastreabilidade de quem executou cada ação.

# Gestão de Vagas — acesso interno

O aplicativo exige e-mail e senha da conta Supabase KPH. Depois do login, chama `get_job_requisition_access()` para obter as empresas permitidas. O formulário e o banco de vagas só são montados se houver uma empresa autorizada. A tabela `job_requisitions` continua sendo protegida no banco por RLS; o filtro visual não substitui essa proteção.

## Configuração

Copie `.env.example` para `.env.local` e use somente a **publishable** em `VITE_SUPABASE_PUBLISHABLE_KEY`. Não use JWT anon legado, `service_role` ou `sb_secret` no cliente. No Vercel, a variável pública está cadastrada para production, preview e development. As variáveis EmailJS existentes continuam sendo usadas somente após salvar uma nova requisição; não são necessárias nos testes.

Contrato do banco: `get_job_requisition_access()` não recebe parâmetros, só permite `authenticated` e retorna `text[]` com subconjunto de `HOS`, `Meet & Eat`, `Mdna`, `Match Point`, `Frêneze`. A RLS deve aplicar o mesmo escopo nas leituras e escritas. Requisições antigas sem empresa válida precisam ser classificadas ao editar; não houve backfill automático.

## Desenvolvimento e verificação

```sh
npm ci
npm run build
npm test
```

Os testes usam Chrome instalado e interceptam todas as chamadas Supabase/EmailJS. Não criam vagas, contas ou e-mails reais. Cobrem visitante anônimo, usuário sem papel, escopo de empresa, logout e falha ao verificar permissões. Para verificar os mesmos fluxos no código publicado, use `FORM_BASE_URL=https://formulario-recrutamento.vercel.app npm test`.

O teste de interface com API simulada não substitui a prova de RLS no banco. A migração de segurança KPH é aplicada separadamente, após distribuir o frontend autenticado. Não reintroduzir policies anônimas do antigo schema.

Publicação de 02/10/2026: deployment `dpl_D9twVzdoQJNfcnCU8jrgkr2tgvWV`, sem cache de build. O frontend usa a nova publishable e não depende da anon que será revogada no corte.

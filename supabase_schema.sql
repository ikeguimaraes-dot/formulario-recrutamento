-- ============================================================
-- Job Requisitions — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists public.job_requisitions (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  status                    text not null default 'pending_hr_review',

  -- Section 1: Dados da Vaga
  area                      text,
  cargo                     text,
  motivo                    text,  -- 'substituicao' | 'aumento_quadro' | 'nova_posicao'
  justificativa_vaga        text,
  data_limite               date,

  -- Section 2: Escopo e Realidade da Operação
  resumo_responsabilidades  text,
  desafios_reais            text,

  -- Section 3: Perfil do Candidato
  hard_skills_obrigatorios  text,
  hard_skills_desejaveis    text,
  soft_skills               text,
  fatores_eliminatorios     text,

  -- Section 4: Teste de Alinhamento (RH)
  cenario_pratico           text,
  gabarito_rh               text,

  -- Section 5: Proposta de Valor
  proposta_valor            text
);

-- Optional: index for filtering by status
create index if not exists idx_job_requisitions_status
  on public.job_requisitions (status);

-- Row-level security: allow anonymous insert (for internal managers without auth)
-- If you add Supabase Auth later, replace the policy below.
alter table public.job_requisitions enable row level security;

create policy "Allow anonymous inserts"
  on public.job_requisitions
  for insert
  to anon
  with check (true);

-- HR admins can read all rows (adjust to match your auth setup)
create policy "Allow authenticated reads"
  on public.job_requisitions
  for select
  to authenticated
  using (true);

-- ============================================================
-- MIGRATION — run this if the table already exists
-- ============================================================
-- alter table public.job_requisitions
--   add column if not exists justificativa_vaga text;

-- Migration v2 — add nome_solicitante and vale_transporte
alter table public.job_requisitions
  add column if not exists nome_solicitante text,
  add column if not exists vale_transporte  text;

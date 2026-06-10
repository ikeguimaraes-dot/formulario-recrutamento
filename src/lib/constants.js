export const EMPRESAS = ['HOS', 'Meet & Eat', 'Mdna', 'Match Point', 'Frêneze']

export const AREAS = [
  'Cozinha',
  'Salão / F&B',
  'Recepção / Front Office',
  'Governança / Housekeeping',
  'Manutenção',
  'Compras',
  'Financeiro / Controladoria',
  'Recursos Humanos',
  'Marketing & Eventos',
  'Gerência Geral',
  'Outro',
]

export const MOTIVO_LABELS = {
  substituicao:   'Substituição',
  aumento_quadro: 'Aumento de Quadro',
  nova_posicao:   'Nova Posição',
}

export const STATUS_CONFIG = {
  pending_hr_review: {
    label:     'Aguardando RH',
    className: 'bg-gold/15 text-gold border border-gold/25',
  },
  approved: {
    label:     'Aprovada',
    className: 'bg-emerald-900/20 text-emerald-300 border border-emerald-700/25',
  },
  rejected: {
    label:     'Reprovada',
    className: 'bg-burgundy/20 text-red-300 border border-burgundy/30',
  },
  filled: {
    label:     'Preenchida',
    className: 'bg-cream/5 text-cream/40 border border-cream/10',
  },
}

export const FORM_INITIAL = {
  empresa:                   '',
  nome_solicitante:          '',
  area:                      '',
  cargo:                     '',
  motivo:                    '',
  justificativa_vaga:        '',
  vale_transporte:           '',
  data_limite:               '',
  resumo_responsabilidades:  '',
  desafios_reais:            '',
  hard_skills_obrigatorios:  '',
  hard_skills_desejaveis:    '',
  soft_skills:               '',
  fatores_eliminatorios:     '',
  cenario_pratico:           '',
  gabarito_rh:               '',
  proposta_valor:            '',
}

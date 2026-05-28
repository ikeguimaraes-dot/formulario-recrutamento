import emailjs from '@emailjs/browser'
import { MOTIVO_LABELS } from './constants'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function fmt(form) {
  const date = form.data_limite
    ? new Date(form.data_limite + 'T00:00:00').toLocaleDateString('pt-BR')
    : 'Não informado'

  return [
    `ÁREA / SETOR: ${form.area || '—'}`,
    `CARGO: ${form.cargo || '—'}`,
    `MOTIVO DA ABERTURA: ${MOTIVO_LABELS[form.motivo] || '—'}`,
    `JUSTIFICATIVA DA VAGA:\n${form.justificativa_vaga || '—'}`,
    `DATA LIMITE: ${date}`,
    '',
    '── ESCOPO E REALIDADE ──────────────────',
    `RESUMO DAS RESPONSABILIDADES:\n${form.resumo_responsabilidades || '—'}`,
    `DESAFIOS REAIS:\n${form.desafios_reais || '—'}`,
    '',
    '── PERFIL DO CANDIDATO ─────────────────',
    `HARD SKILLS OBRIGATÓRIOS:\n${form.hard_skills_obrigatorios || '—'}`,
    `HARD SKILLS DESEJÁVEIS:\n${form.hard_skills_desejaveis || '—'}`,
    `SOFT SKILLS / POSTURA:\n${form.soft_skills || '—'}`,
    `FATORES ELIMINATÓRIOS / DEALBREAKERS:\n${form.fatores_eliminatorios || '—'}`,
    '',
    '── TESTE DE ALINHAMENTO (RH) ───────────',
    `CENÁRIO PRÁTICO:\n${form.cenario_pratico || '—'}`,
    `GABARITO RH:\n${form.gabarito_rh || '—'}`,
    '',
    '── PROPOSTA DE VALOR ───────────────────',
    `O QUE OFERECEMOS:\n${form.proposta_valor || '—'}`,
  ].join('\n')
}

export function emailjsConfigured() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)
}

export async function sendRequisitionEmail(form) {
  if (!emailjsConfigured()) {
    console.warn('[email] EmailJS vars not set — skipping notification.')
    return { skipped: true }
  }

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: 'grupomeeteat@gmail.com',
      cargo:    form.cargo || 'Nova Vaga',
      area:     form.area  || '—',
      motivo:   MOTIVO_LABELS[form.motivo] || '—',
      message:  fmt(form),
    },
    PUBLIC_KEY
  )
}

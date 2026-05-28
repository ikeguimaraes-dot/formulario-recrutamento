import { useEffect, useRef } from 'react'
import { MOTIVO_LABELS, STATUS_CONFIG } from '../lib/constants'

/* ── Helpers ─────────────────────────────────────────── */

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('pt-BR')
}
function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
function v(val) { return val || '—' }

/* ── Print primitives ────────────────────────────────── */

const S = {
  root: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    color: '#111',
    background: '#fff',
    fontSize: '11px',
    lineHeight: '1.5',
  },
  hr: { border: 'none', borderTop: '1px solid #ccc', margin: '0' },
  hrBold: { border: 'none', borderTop: '2px solid #111', margin: '0' },
  label: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '7.5px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#666',
    fontWeight: '500',
    marginBottom: '3px',
    display: 'block',
  },
  labelDanger: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '7.5px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#7a0019',
    fontWeight: '500',
    marginBottom: '3px',
    display: 'block',
  },
  value: { fontSize: '11px', whiteSpace: 'pre-wrap', margin: 0 },
  valueLg: { fontSize: '18px', fontWeight: '500', margin: 0, lineHeight: '1.2' },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    paddingBottom: '5px',
  },
  sectionNum: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '8px',
    letterSpacing: '0.2em',
    color: '#999',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 'normal',
    margin: 0,
  },
}

function PField({ label, value, large, danger }) {
  return (
    <div>
      <span style={danger ? S.labelDanger : S.label}>{label}</span>
      <p style={large ? S.valueLg : S.value}>{value}</p>
    </div>
  )
}

function PSection({ number, title, children }) {
  return (
    <div style={{ marginBottom: '18px', breakInside: 'avoid' }}>
      <div style={S.sectionHead}>
        <span style={S.sectionNum}>{number}</span>
        <h2 style={S.sectionTitle}>{title}</h2>
      </div>
      <hr style={S.hr} />
      <div style={{ paddingTop: '10px', display: 'grid', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────── */

export default function PrintView({ record, onDone }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const timer = setTimeout(() => {
      window.onafterprint = () => {
        window.onafterprint = null
        onDoneRef.current()
      }
      window.print()
    }, 180)

    return () => {
      clearTimeout(timer)
      window.onafterprint = null
    }
  }, [])

  const motivo      = MOTIVO_LABELS[record.motivo] || record.motivo || '—'
  const statusLabel = (STATUS_CONFIG[record.status] || { label: record.status }).label

  return (
    <div className="hidden print:block">
      <div style={S.root}>

        {/* Document header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '10px' }}>
          <div>
            <p style={{ ...S.label, marginBottom: '5px' }}>
              Meet &amp; Eat · KPH Participações · Recursos Humanos
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 'normal', letterSpacing: '0.04em', margin: 0 }}>
              Requisição de Vaga
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ ...S.label, display: 'block', textAlign: 'right' }}>Documento Interno · Confidencial</span>
            <p style={{ margin: 0, fontSize: '10px' }}>Emitido em {fmtDateTime(record.created_at)}</p>
          </div>
        </div>
        <hr style={S.hrBold} />

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px', padding: '12px 0 14px' }}>
          <PField label="Cargo" value={v(record.cargo)} large />
          <PField label="Área / Setor" value={v(record.area)} />
          <PField label="Motivo da Abertura" value={motivo} />
          <PField label="Status" value={statusLabel} />
          <PField label="Data Limite" value={fmtDate(record.data_limite)} />
          <PField label="Solicitado por" value={v(record.nome_solicitante)} />
        </div>
        <hr style={{ ...S.hr, borderTopColor: '#aaa', marginBottom: '18px' }} />

        {/* Section 01 */}
        <PSection number="01" title="Dados da Vaga">
          <PField label="Justificativa da Vaga" value={v(record.justificativa_vaga)} />
          <PField
            label="Vale Transporte Máximo"
            value={record.vale_transporte ? `R$ ${record.vale_transporte}` : '—'}
          />
        </PSection>

        {/* Section 02 */}
        <PSection number="02" title="Escopo e Realidade da Operação">
          <PField label="Resumo das Responsabilidades" value={v(record.resumo_responsabilidades)} />
          <PField label="Desafios Reais / Choque de Realidade" value={v(record.desafios_reais)} />
        </PSection>

        {/* Section 03 */}
        <PSection number="03" title="Perfil do Candidato">
          <PField label="Hard Skills Obrigatórios" value={v(record.hard_skills_obrigatorios)} />
          <PField label="Hard Skills Desejáveis" value={v(record.hard_skills_desejaveis)} />
          <PField label="Soft Skills / Postura" value={v(record.soft_skills)} />
          <div style={{ border: '1px solid #9a0020', padding: '8px 10px', breakInside: 'avoid' }}>
            <PField
              label="⚠ Fatores Eliminatórios / Dealbreakers"
              value={v(record.fatores_eliminatorios)}
              danger
            />
          </div>
        </PSection>

        {/* Section 04 */}
        <PSection number="04" title="Teste de Alinhamento — Para uso interno do RH">
          <PField label="Cenário Prático Sugerido" value={v(record.cenario_pratico)} />
          <PField label="O que avaliar / Gabarito" value={v(record.gabarito_rh)} />
        </PSection>

        {/* Section 05 */}
        <PSection number="05" title="Proposta de Valor">
          <PField label="O que oferecemos para atrair o talento" value={v(record.proposta_valor)} />
        </PSection>

        {/* Document footer */}
        <hr style={{ ...S.hrBold, marginTop: '20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
          <span style={S.label}>Meet &amp; Eat · KPH Participações · Uso interno e confidencial</span>
          <span style={S.label}>Gerado em {fmtDateTime(record.created_at)}</span>
        </div>

      </div>
    </div>
  )
}

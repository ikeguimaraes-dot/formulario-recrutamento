import { useState, useEffect } from 'react'
import { assertSupabase } from '../lib/supabase'
import { sendRequisitionEmail } from '../lib/email'
import { AREAS, EMPRESAS, FORM_INITIAL } from '../lib/constants'

/* ── Reusable primitives ─────────────────────────────── */

function Label({ children, danger }) {
  return (
    <label className={danger ? 'field-label-danger' : 'field-label'}>
      {children}
    </label>
  )
}

function TextInput({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="field-base"
      />
    </div>
  )
}

function DateInput({ label, name, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="field-base"
      />
    </div>
  )
}

function SelectInput({ label, name, value, onChange, options, placeholder = 'Selecione' }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="field-base appearance-none pr-6 cursor-pointer bg-transparent"
        >
          <option value="" disabled className="bg-forest text-cream/50">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-forest text-cream">
              {opt}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/50"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function RadioGroup({ label, name, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-4 mt-1">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <span
              className={`
                w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                transition-colors duration-150
                ${value === opt.value
                  ? 'border-gold bg-transparent'
                  : 'border-cream/25 group-hover:border-gold/50'}
              `}
            >
              {value === opt.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold block" />
              )}
            </span>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="sr-only"
            />
            <span className="text-sm font-light text-cream/70 group-hover:text-cream transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function Textarea({ label, name, value, onChange, placeholder, rows = 4, danger, required }) {
  return (
    <div>
      <Label danger={danger}>{label}</Label>
      {danger ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className="field-danger w-full"
        />
      ) : (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className="field-textarea w-full"
        />
      )}
    </div>
  )
}

function SectionHeader({ number, title }) {
  return (
    <div className="mb-8">
      <p className="section-number">{number}</p>
      <h2 className="section-title">{title}</h2>
      <div className="section-divider" />
    </div>
  )
}

/* ── Toast ───────────────────────────────────────────── */

const TOAST_CONFIGS = {
  success: {
    text: 'Requisição enviada com sucesso. O RH foi notificado por e-mail.',
    sub: null,
    border: 'border-gold/30',
    icon: <CheckIcon />,
    iconCls: 'text-gold',
  },
  partial: {
    text: 'Requisição salva, mas o e-mail não foi enviado.',
    sub: 'Os dados foram registrados. Verifique as configurações do EmailJS.',
    border: 'border-gold/20',
    icon: <WarnIcon />,
    iconCls: 'text-gold/60',
  },
  updated: {
    text: 'Requisição atualizada com sucesso.',
    sub: null,
    border: 'border-gold/30',
    icon: <CheckIcon />,
    iconCls: 'text-gold',
  },
}

function Toast({ state }) {
  if (!state) return null
  const cfg = TOAST_CONFIGS[state]
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-3rem)] max-w-sm">
      <div className={`flex items-start gap-3 bg-forest-mid border ${cfg.border} px-6 py-4 rounded-sm shadow-2xl`}>
        <span className={`flex-shrink-0 mt-0.5 ${cfg.iconCls}`}>{cfg.icon}</span>
        <div>
          <p className="text-sm font-light tracking-wide text-cream">{cfg.text}</p>
          {cfg.sub && (
            <p className="text-xs text-cream/40 font-light mt-1">{cfg.sub}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function WarnIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

/* ── Main form ───────────────────────────────────────── */

export default function JobRequisitionForm({ editRecord, onBack, onSaved }) {
  const [form, setForm]           = useState(FORM_INITIAL)
  const [loading, setLoading]     = useState(false)
  const [toastState, setToastState] = useState(null)
  const [error, setError]         = useState(null)

  const isEditing = !!editRecord?.id

  // Populate form when editing record changes
  useEffect(() => {
    if (editRecord) {
      const fields = {}
      Object.keys(FORM_INITIAL).forEach((k) => {
        fields[k] = editRecord[k] ?? ''
      })
      setForm(fields)
    } else {
      setForm(FORM_INITIAL)
    }
    setError(null)
    setToastState(null)
  }, [editRecord])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    let sbError
    try {
      const client = assertSupabase()
      if (isEditing) {
        const { error } = await client
          .from('job_requisitions')
          .update({ ...form })
          .eq('id', editRecord.id)
        sbError = error
      } else {
        const { error } = await client
          .from('job_requisitions')
          .insert([{ ...form, status: 'pending_hr_review' }])
        sbError = error
      }
    } catch (err) {
      sbError = { message: err.message }
    }

    if (sbError) {
      setLoading(false)
      setError(sbError.message)
      return
    }

    // EmailJS only for new insertions
    let emailOk = true
    if (!isEditing) {
      try {
        const result = await sendRequisitionEmail(form)
        if (result?.skipped) emailOk = true
      } catch {
        emailOk = false
      }
    }

    setLoading(false)

    const toastKey = isEditing ? 'updated' : emailOk ? 'success' : 'partial'
    setToastState(toastKey)

    const delay = toastKey === 'updated' ? 2500 : 4000
    setTimeout(() => {
      setToastState(null)
      setForm(FORM_INITIAL)
      onSaved?.()
    }, delay)
  }

  return (
    <>
      {/* Desktop sticky header */}
      <header className="hidden md:block border-b border-gold/10 bg-forest sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase font-light">
              Recursos Humanos
            </p>
            <p className="font-serif text-cream text-xl font-normal leading-tight">
              {isEditing ? 'Editando Requisição' : 'Nova Requisição'}
            </p>
          </div>
          <p className="text-cream/20 text-xs font-light tracking-widest uppercase">Uso Interno</p>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        {/* Intro */}
        <div className="mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs text-gold/50 hover:text-gold
                         tracking-widest uppercase mb-6 transition-colors group"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Banco de Vagas
            </button>
          )}
          <h1 className="font-serif text-4xl md:text-5xl text-cream font-normal leading-tight">
            {isEditing ? (
              <>
                Editando<br />
                <span className="text-gold">{editRecord.cargo || 'Requisição'}</span>
              </>
            ) : (
              <>
                Abertura de<br />
                <span className="text-gold">Nova Posição</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-sm font-light text-cream/40 leading-relaxed max-w-md">
            {isEditing
              ? 'Ajuste os campos necessários e salve para atualizar o registro no sistema.'
              : 'Preencha todas as seções com precisão. Este documento orienta o processo seletivo e garante que o perfil contratado atenda exatamente à necessidade da operação.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">

            {/* ── Section 1 ── */}
            <div className="section-card">
              <SectionHeader number="01" title="Dados da Vaga" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <SelectInput
                  label="Empresa"
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  options={EMPRESAS}
                  placeholder="Selecione uma empresa"
                />
                <SelectInput
                  label="Área / Setor"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  options={AREAS}
                  placeholder="Selecione uma área"
                />
                <TextInput
                  label="Cargo"
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  placeholder="Ex.: Sous Chef, Recepcionista Noturno"
                />
                <div className="md:col-span-2">
                  <RadioGroup
                    label="Motivo da Abertura"
                    name="motivo"
                    value={form.motivo}
                    onChange={handleChange}
                    options={[
                      { value: 'substituicao',   label: 'Substituição' },
                      { value: 'aumento_quadro', label: 'Aumento de Quadro' },
                      { value: 'nova_posicao',   label: 'Nova Posição' },
                    ]}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Motivo da Vaga (Justificativa) *"
                    name="justificativa_vaga"
                    value={form.justificativa_vaga}
                    onChange={handleChange}
                    placeholder="Descreva com precisão por que esta posição é necessária para a operação agora. Inclua contexto, impacto e urgência…"
                    rows={4}
                    required
                  />
                </div>
                <TextInput
                  label="Nome do Solicitante *"
                  name="nome_solicitante"
                  value={form.nome_solicitante}
                  onChange={handleChange}
                  placeholder="Nome completo do gestor solicitante"
                />
                <TextInput
                  label="Vale Transporte Máximo (R$) *"
                  name="vale_transporte"
                  value={form.vale_transporte}
                  onChange={handleChange}
                  placeholder="Ex.: 250,00"
                />
                <DateInput
                  label="Data Limite para Contratação"
                  name="data_limite"
                  value={form.data_limite}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ── Section 2 ── */}
            <div className="section-card">
              <SectionHeader number="02" title="Escopo e Realidade da Operação" />
              <div className="space-y-8">
                <Textarea
                  label="Resumo das Responsabilidades"
                  name="resumo_responsabilidades"
                  value={form.resumo_responsabilidades}
                  onChange={handleChange}
                  placeholder="Descreva as principais responsabilidades do cargo no contexto da nossa operação…"
                  rows={5}
                />
                <Textarea
                  label="Choque de Realidade / Desafios Reais"
                  name="desafios_reais"
                  value={form.desafios_reais}
                  onChange={handleChange}
                  placeholder="O que esta posição exige que pode surpreender ou ser difícil para um candidato despreparado? Seja honesto…"
                  rows={5}
                />
              </div>
            </div>

            {/* ── Section 3 ── */}
            <div className="section-card">
              <SectionHeader number="03" title="Perfil do Candidato" />
              <div className="space-y-8">
                <Textarea
                  label="Hard Skills Obrigatórios"
                  name="hard_skills_obrigatorios"
                  value={form.hard_skills_obrigatorios}
                  onChange={handleChange}
                  placeholder="Conhecimentos técnicos indispensáveis para ingressar na função…"
                  rows={4}
                />
                <Textarea
                  label="Hard Skills Desejáveis"
                  name="hard_skills_desejaveis"
                  value={form.hard_skills_desejaveis}
                  onChange={handleChange}
                  placeholder="Competências técnicas que representam um diferencial…"
                  rows={4}
                />
                <Textarea
                  label="Soft Skills / Postura"
                  name="soft_skills"
                  value={form.soft_skills}
                  onChange={handleChange}
                  placeholder="Perfil comportamental, valores e postura esperados…"
                  rows={4}
                />
                <div className="border-l-2 border-burgundy/50 pl-5">
                  <Textarea
                    label="Fatores Eliminatórios / Dealbreakers"
                    name="fatores_eliminatorios"
                    value={form.fatores_eliminatorios}
                    onChange={handleChange}
                    placeholder="Comportamentos, históricos ou características que desqualificam automaticamente o candidato…"
                    rows={4}
                    danger
                  />
                  <p className="mt-2 text-xs text-burgundy/70 font-light">
                    Critério de alta relevância — candidatos com estes fatores não devem avançar no processo.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section 4 ── */}
            <div className="section-card">
              <SectionHeader number="04" title="Teste de Alinhamento" />
              <p className="text-xs text-cream/30 font-light -mt-4 mb-8 tracking-wide uppercase">
                Para uso interno do RH
              </p>
              <div className="space-y-8">
                <Textarea
                  label="Cenário Prático Sugerido"
                  name="cenario_pratico"
                  value={form.cenario_pratico}
                  onChange={handleChange}
                  placeholder="Descreva uma situação real ou simulada que o candidato deve resolver ou narrar durante a entrevista…"
                  rows={5}
                />
                <Textarea
                  label="O que o RH deve avaliar / Gabarito"
                  name="gabarito_rh"
                  value={form.gabarito_rh}
                  onChange={handleChange}
                  placeholder="Quais respostas ou comportamentos indicam alinhamento? O que deve acender um alerta?…"
                  rows={5}
                />
              </div>
            </div>

            {/* ── Section 5 ── */}
            <div className="section-card">
              <SectionHeader number="05" title="Proposta de Valor" />
              <Textarea
                label="O que oferecemos para atrair o talento?"
                name="proposta_valor"
                value={form.proposta_valor}
                onChange={handleChange}
                placeholder="Ambiente, cultura, benefícios, oportunidades de crescimento, o que torna esta posição atrativa para o perfil certo…"
                rows={5}
              />
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-start gap-3 bg-burgundy/10 border border-burgundy/30 rounded-sm px-5 py-4">
              <svg className="w-4 h-4 text-burgundy/70 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-sm font-light text-cream/70">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button
              type="submit"
              disabled={loading}
              className="
                px-10 py-3.5 bg-gold text-forest text-sm font-medium tracking-widest uppercase
                transition-all duration-200 hover:bg-gold-light active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-gold/40 focus:ring-offset-2 focus:ring-offset-forest
              "
            >
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <LoadingSpinner />
                  {isEditing ? 'Salvando…' : 'Enviando…'}
                </span>
              ) : (
                isEditing ? 'Salvar Alterações' : 'Enviar Requisição'
              )}
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-cream/25 font-light tracking-widest uppercase hover:text-cream/50 transition-colors"
              >
                Cancelar
              </button>
            )}
            {!onBack && (
              <p className="text-xs text-cream/25 font-light leading-relaxed max-w-xs">
                Ao enviar, esta requisição será encaminhada ao RH com status{' '}
                <em>pendente de revisão</em>.
              </p>
            )}
          </div>
        </form>
      </div>

      <Toast state={toastState} />
    </>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

import { useState, useEffect } from 'react'
import { assertSupabase } from '../lib/supabase'
import { MOTIVO_LABELS, STATUS_CONFIG, EMPRESAS } from '../lib/constants'

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

/* ── Skeleton card ───────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="section-card animate-pulse space-y-4">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-sm bg-gold/10" />
        <div className="h-5 w-24 rounded-sm bg-gold/10" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-40 rounded-sm bg-cream/5" />
        <div className="h-4 w-28 rounded-sm bg-cream/5" />
      </div>
      <div className="h-12 rounded-sm bg-cream/5" />
      <div className="h-px bg-gold/10" />
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-sm bg-gold/10" />
        <div className="h-8 w-20 rounded-sm bg-gold/10" />
        <div className="h-8 w-20 rounded-sm bg-gold/10" />
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────── */

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg className="w-12 h-12 text-gold/20 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M9 13h6m-3-3v6m-6 5h12a2 2 0 002-2V7l-5-5H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <p className="font-serif text-2xl text-cream/40 font-normal">Nenhuma requisição</p>
      <p className="text-sm text-cream/25 font-light mt-2 mb-8">
        Ainda não há vagas registradas no sistema.
      </p>
      <button
        onClick={onNew}
        className="px-8 py-3 bg-gold text-forest text-xs font-medium tracking-widest uppercase
                   hover:bg-gold-light transition-colors"
      >
        Criar Primeira Requisição
      </button>
    </div>
  )
}

/* ── Requisition card ────────────────────────────────── */

function RequisitionCard({ record, onEdit, onPrint, onDelete, confirmingDelete, setConfirmingDelete }) {
  const status = STATUS_CONFIG[record.status] || {
    label: record.status || 'Desconhecido',
    className: 'bg-cream/5 text-cream/40 border border-cream/10',
  }
  const motivo = MOTIVO_LABELS[record.motivo] || record.motivo || '—'
  const isConfirming = confirmingDelete === record.id

  return (
    <div className="section-card flex flex-col gap-5 group">
      {/* Top badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {record.empresa && (
          <span className="text-[10px] font-light tracking-[0.15em] uppercase text-cream/50
                           border border-cream/15 px-2.5 py-1">
            {record.empresa}
          </span>
        )}
        {record.area && (
          <span className="text-[10px] font-light tracking-[0.15em] uppercase text-gold/70
                           border border-gold/20 px-2.5 py-1">
            {record.area}
          </span>
        )}
        <span className={`text-[10px] font-light tracking-[0.12em] uppercase px-2.5 py-1 ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Main info */}
      <div>
        <p className="font-serif text-2xl text-cream font-normal leading-tight">
          {record.cargo || <span className="text-cream/30 italic">Cargo não informado</span>}
        </p>
        {record.nome_solicitante && (
          <p className="text-xs font-light text-gold/60 mt-1.5 tracking-wide">
            Solicitado por: <span className="text-gold/80">{record.nome_solicitante}</span>
          </p>
        )}
        <p className="text-sm font-light text-cream/40 mt-1">{motivo}</p>
        {record.data_limite && (
          <p className="text-xs font-light text-cream/30 mt-0.5">
            Prazo: {fmtDate(record.data_limite)}
          </p>
        )}
      </div>

      {/* Justificativa preview */}
      {record.justificativa_vaga && (
        <p className="text-xs font-light text-cream/35 leading-relaxed line-clamp-2">
          {record.justificativa_vaga}
        </p>
      )}

      {/* Meta */}
      <p className="text-[10px] font-light text-cream/20 tracking-wide">
        Criado em {fmtDateTime(record.created_at)}
      </p>

      {/* Divider */}
      <div className="h-px bg-gold/10" />

      {/* Actions */}
      {isConfirming ? (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-light text-cream/50 tracking-wide">
            Confirmar exclusão?
          </span>
          <button
            onClick={() => onDelete(record.id)}
            className="px-4 py-1.5 bg-burgundy text-cream/90 text-xs tracking-widest uppercase
                       hover:bg-burgundy-light transition-colors"
          >
            Excluir
          </button>
          <button
            onClick={() => setConfirmingDelete(null)}
            className="px-4 py-1.5 border border-cream/15 text-cream/40 text-xs tracking-widest uppercase
                       hover:border-cream/30 hover:text-cream/60 transition-colors"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit */}
          <button
            onClick={() => onEdit(record)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/25 text-gold/70
                       text-xs tracking-widest uppercase hover:border-gold hover:text-gold
                       transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>

          {/* Print */}
          <button
            onClick={() => onPrint(record)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-cream/15 text-cream/35
                       text-xs tracking-widest uppercase hover:border-cream/30 hover:text-cream/60
                       transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>

          {/* Delete */}
          <button
            onClick={() => setConfirmingDelete(record.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-cream/20
                       text-xs tracking-widest uppercase hover:border-burgundy/40 hover:text-burgundy/70
                       transition-colors ml-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deletar
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main component ──────────────────────────────────── */

export default function BancoDeVagas({ onEdit, onPrint, onNew }) {
  const [records, setRecords]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [filterEmpresa, setFilterEmpresa]   = useState('')

  const filtered = filterEmpresa
    ? records.filter((r) => r.empresa === filterEmpresa)
    : records

  async function fetchRecords() {
    setLoading(true)
    setError(null)
    try {
      const client = assertSupabase()
      const { data, error: sbError } = await client
        .from('job_requisitions')
        .select('*')
        .order('created_at', { ascending: false })
      if (sbError) throw sbError
      setRecords(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecords() }, [])

  async function handleDelete(id) {
    try {
      const client = assertSupabase()
      const { error: sbError } = await client
        .from('job_requisitions')
        .delete()
        .eq('id', id)
      if (sbError) throw sbError
      setRecords((prev) => prev.filter((r) => r.id !== id))
      setConfirmingDelete(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-24">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-cream font-normal leading-tight">
            Banco de <span className="text-gold">Vagas</span>
          </h1>
          {!loading && !error && (
            <p className="text-sm font-light text-cream/35 mt-2">
              {records.length === 0
                ? 'Nenhuma requisição registrada'
                : filterEmpresa
                  ? `${filtered.length} de ${records.length} requisiç${records.length === 1 ? 'ão' : 'ões'}`
                  : `${records.length} requisiç${records.length === 1 ? 'ão' : 'ões'} encontrada${records.length === 1 ? '' : 's'}`
              }
            </p>
          )}
        </div>
        <button
          onClick={onNew}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gold text-forest
                     text-xs font-medium tracking-widest uppercase hover:bg-gold-light
                     transition-colors mt-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova
        </button>
      </div>

      {/* Empresa filter pills */}
      {!loading && records.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilterEmpresa('')}
            className={`px-3.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
              filterEmpresa === ''
                ? 'bg-gold text-forest font-medium'
                : 'border border-gold/40 text-cream/60 hover:border-gold/70 hover:text-cream/80'
            }`}
          >
            Todas
          </button>
          {EMPRESAS.map((emp) => (
            <button
              key={emp}
              onClick={() => setFilterEmpresa(emp)}
              className={`px-3.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
                filterEmpresa === emp
                  ? 'bg-gold text-forest font-medium'
                  : 'border border-gold/40 text-cream/60 hover:border-gold/70 hover:text-cream/80'
              }`}
            >
              {emp}
            </button>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-burgundy/10 border border-burgundy/30 rounded-sm px-5 py-4 mb-8">
          <svg className="w-4 h-4 text-burgundy/70 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-light text-cream/70">{error}</p>
            <button onClick={fetchRecords} className="text-xs text-gold/60 hover:text-gold mt-1.5 transition-colors">
              Tentar novamente →
            </button>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state — no records at all */}
      {!loading && !error && records.length === 0 && (
        <EmptyState onNew={onNew} />
      )}

      {/* Empty state — filter returned nothing */}
      {!loading && !error && records.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="font-serif text-xl text-cream/30 font-normal">
            Nenhuma requisição para <span className="text-cream/50">{filterEmpresa}</span>
          </p>
          <button
            onClick={() => setFilterEmpresa('')}
            className="text-xs text-gold/60 hover:text-gold mt-3 transition-colors tracking-widest uppercase"
          >
            Ver todas →
          </button>
        </div>
      )}

      {/* Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((record) => (
            <RequisitionCard
              key={record.id}
              record={record}
              onEdit={onEdit}
              onPrint={onPrint}
              onDelete={handleDelete}
              confirmingDelete={confirmingDelete}
              setConfirmingDelete={setConfirmingDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

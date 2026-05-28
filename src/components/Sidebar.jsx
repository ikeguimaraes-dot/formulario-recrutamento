import { useEffect } from 'react'

const NAV_ITEMS = [
  {
    id: 'nova',
    label: 'Nova Requisição',
    sub: 'Abrir nova vaga',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
          d="M9 13h6m-3-3v6m-6 5h12a2 2 0 002-2V7l-5-5H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'banco',
    label: 'Banco de Vagas',
    sub: 'Visualizar registros',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeView, onNavigate, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full w-64 bg-forest border-r border-gold/10 z-30
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Brand */}
      <div className="px-6 py-7 border-b border-gold/10 flex-shrink-0">
        <p className="text-gold/50 text-[9px] tracking-[0.35em] uppercase font-light">
          Recursos Humanos
        </p>
        <p className="font-serif text-cream text-xl mt-0.5 leading-tight">
          Gestão de Vagas
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3.5 px-4 py-3.5 rounded-sm text-left
                transition-all duration-150 group relative
                ${active
                  ? 'bg-gold/10 text-cream'
                  : 'text-cream/35 hover:text-cream hover:bg-white/[0.03]'}
              `}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r" />
              )}

              {/* Icon */}
              <span className={`flex-shrink-0 transition-colors duration-150
                ${active ? 'text-gold' : 'text-cream/25 group-hover:text-gold/50'}`}>
                {item.icon}
              </span>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-[13px] font-light tracking-wide leading-tight truncate">
                  {item.label}
                </p>
                <p className="text-[11px] text-cream/25 leading-tight mt-0.5 group-hover:text-cream/35 transition-colors">
                  {item.sub}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-gold/10 flex-shrink-0">
        <p className="text-[9px] text-cream/15 font-light tracking-[0.25em] uppercase leading-relaxed">
          Uso Interno
          <br />
          Documento Confidencial
        </p>
      </div>
    </aside>
  )
}

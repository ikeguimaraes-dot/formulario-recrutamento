import { useState } from 'react'
import Sidebar from './components/Sidebar'
import JobRequisitionForm from './components/JobRequisitionForm'
import BancoDeVagas from './components/BancoDeVagas'
import PrintView from './components/PrintView'

export default function App() {
  const [view, setView]           = useState('nova')
  const [editRecord, setEditRecord] = useState(null)
  const [printRecord, setPrintRecord] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigateTo(v) {
    setView(v)
    if (v !== 'nova') setEditRecord(null)
    setSidebarOpen(false)
  }

  function handleEdit(record) {
    setEditRecord(record)
    setView('nova')
    setSidebarOpen(false)
  }

  function handleSaved() {
    setEditRecord(null)
    setView('banco')
  }

  function handleBack() {
    setEditRecord(null)
    setView('banco')
  }

  const mobileTitle = view === 'banco'
    ? 'Banco de Vagas'
    : editRecord ? 'Editando Vaga' : 'Nova Requisição'

  return (
    <>
      {/* Print view — rendered outside app shell, hidden on screen */}
      {printRecord && (
        <PrintView
          record={printRecord}
          onDone={() => setPrintRecord(null)}
        />
      )}

      {/* App shell — hidden during print */}
      <div className="print:hidden min-h-screen bg-forest flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          activeView={view}
          onNavigate={navigateTo}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main — scrolls independently */}
        <main className="flex-1 md:ml-64 h-screen overflow-y-auto">
          {/* Mobile top bar */}
          <div className="md:hidden sticky top-0 z-10 bg-forest border-b border-gold/10 px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-cream/40 hover:text-cream transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-gold/50 text-[9px] tracking-[0.3em] uppercase font-light">
                Recursos Humanos
              </p>
              <p className="font-serif text-cream text-base leading-tight">{mobileTitle}</p>
            </div>
          </div>

          {/* View content */}
          {view === 'nova' && (
            <JobRequisitionForm
              editRecord={editRecord}
              onBack={editRecord ? handleBack : null}
              onSaved={handleSaved}
            />
          )}
          {view === 'banco' && (
            <BancoDeVagas
              onEdit={handleEdit}
              onPrint={(record) => setPrintRecord(record)}
              onNew={() => navigateTo('nova')}
            />
          )}
        </main>
      </div>
    </>
  )
}

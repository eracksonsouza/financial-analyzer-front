import { useEffect, useMemo, useState } from 'react'
import { History, Moon } from 'lucide-react'
import { AnalysisForm } from './components/analysis/AnalysisForm'
import { AnalysisResult } from './components/analysis/AnalysisResult'
import { HistoryPanel } from './components/history/HistoryPanel'
import { Dashboard } from './components/dashboard/Dashboard'
import { MonthSelect } from './components/controls/MonthSelect'
import type { AnalysisResponse, HistoryItemDTO } from './services/api'
import { getHistory } from './services/api'
import { getUserProfile } from './services/auth'
import { getErrorMessage } from './services/http'
import { useAsync } from './lib/useAsync'
import logoAnalyzer from './assets/logo-analyzer.png'
import categoryIcon from './assets/category.png'
import chartIcon from './assets/chart.png'
import './app.css'

type View = 'dashboard' | 'analysis' | 'result' | 'history'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()))

  const user = useMemo(() => getUserProfile(), [])

  const {
    data: historyItems,
    error: historyError,
    loading: historyLoading,
  } = useAsync(getHistory, [])

  useEffect(() => {
    if (!historyItems || historyItems.length === 0) return
    const latest = getLatestMonthKey(historyItems)
    if (latest) setSelectedMonth(latest)
  }, [historyItems])

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>()
    ;(historyItems ?? []).forEach((item) => {
      const date = new Date(item.created_at)
      const key = getMonthKey(date)
      months.set(key, formatMonthLabel(date))
    })

    if (months.size === 0) {
      const current = new Date()
      months.set(getMonthKey(current), formatMonthLabel(current))
    }

    return Array.from(months.entries())
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([key, label]) => ({ key, label }))
  }, [historyItems])

  useEffect(() => {
    if (!monthOptions.find((opt) => opt.key === selectedMonth) && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0].key)
    }
  }, [monthOptions, selectedMonth])

  const filteredHistory = useMemo(
    () => (historyItems ?? []).filter((item) => getMonthKey(new Date(item.created_at)) === selectedMonth),
    [historyItems, selectedMonth]
  )

  function handleResult(res: AnalysisResponse) {
    setResult(res)
    setView('result')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="brand-logo" src={logoAnalyzer} alt="Finance Analyzer" />
          <span>Finance Analyzer</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={view === 'dashboard' ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => setView('dashboard')}
          >
            <img className="sidebar-icon" src={categoryIcon} alt="Dashboard" /> Dashboard
          </button>
          <button
            className={view === 'analysis' || view === 'result' ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => setView('analysis')}
          >
            <img className="sidebar-icon" src={chartIcon} alt="Análise" /> Análise
          </button>
          <button
            className={view === 'history' ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => setView('history')}
          >
            <History size={16} /> Histórico
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar" />
          {user ? (
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          ) : (
            <div className="user-empty">Não autenticado</div>
          )}
        </div>
      </aside>

      <main className="app-content">
        <header className="topbar">
          <div>
            <div className="topbar-label">{user ? `Olá, ${user.name}!` : 'Olá!'}</div>
            <div className="topbar-sub">Seu resumo financeiro do mês</div>
          </div>
          <div className="topbar-actions">
            <button className="icon-pill">
              <Moon size={14} />
            </button>
            <MonthSelect
              value={selectedMonth}
              options={monthOptions}
              onChange={setSelectedMonth}
            />
          </div>
        </header>

        {historyError ? (
          <p className="dashboard-error">
            {getErrorMessage(historyError, 'Não foi possível carregar os dados do dashboard.')}
          </p>
        ) : null}

        {view === 'dashboard' && (
          historyLoading ? (
            <div className="loading">
              <div className="spinner" />
              carregando dashboard...
            </div>
          ) : (
            <Dashboard history={filteredHistory} />
          )
        )}
        {view === 'analysis' && <AnalysisForm onResult={handleResult} />}
        {view === 'result' && result && (
          <AnalysisResult
            result={result}
            onReset={() => setView('analysis')}
          />
        )}
        {view === 'history' && (
          <HistoryPanel onSelect={(res) => handleResult(res)} />
        )}
      </main>
    </div>
  )
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(date: Date) {
  const label = date.toLocaleDateString('pt-BR', { month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function getLatestMonthKey(items: HistoryItemDTO[]) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return sorted[0] ? getMonthKey(new Date(sorted[0].created_at)) : ''
}

import { useState } from 'react'
import { postAnalysis } from '../../services/api'
import type { AnalysisResponse, Expenses } from '../../services/api'

const CATEGORIES: { key: keyof Expenses; label: string; icon: string }[] = [
  { key: 'moradia',     label: 'moradia',     icon: '🏠' },
  { key: 'alimentacao', label: 'alimentação', icon: '🛒' },
  { key: 'transporte',  label: 'transporte',  icon: '🚗' },
  { key: 'saude',       label: 'saúde',       icon: '💊' },
  { key: 'lazer',       label: 'lazer',       icon: '🎮' },
  { key: 'educacao',    label: 'educação',    icon: '📚' },
  { key: 'dividas',     label: 'dívidas',     icon: '💳' },
  { key: 'outros',      label: 'outros',      icon: '📦' },
]

const emptyExpenses = (): Expenses => ({
  moradia: 0, alimentacao: 0, transporte: 0, saude: 0,
  lazer: 0, educacao: 0, dividas: 0, outros: 0,
})

interface Props {
  onResult: (res: AnalysisResponse) => void
}

export function AnalysisForm({ onResult }: Props) {
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState<Expenses>(emptyExpenses())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    const inc = parseFloat(income)
    if (!inc || inc <= 0) { setError('Informe uma renda válida.'); return }

    setLoading(true)
    setError('')

    try {
      const result = await postAnalysis(inc, expenses)
      onResult(result)
    } catch (e: any) {
      setError(e.message || 'Erro ao analisar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function setExp(key: keyof Expenses, val: string) {
    setExpenses(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  return (
    <div>
      <div className="form-section">
        <div className="section-label">renda mensal líquida</div>
        <div className="income-row">
          <span className="currency">R$</span>
          <input
            className="income-input"
            type="number"
            placeholder="0"
            value={income}
            onChange={e => setIncome(e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">despesas mensais por categoria</div>
        <div className="expenses-grid">
          {CATEGORIES.map(({ key, label, icon }) => (
            <div key={key} className="expense-card">
              <div className="expense-label">
                <span>{icon}</span> {label}
              </div>
              <input
                className="expense-input"
                type="number"
                placeholder="0"
                value={expenses[key] || ''}
                onChange={e => setExp(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'analisando...' : 'analisar saúde financeira'}
      </button>
    </div>
  )
}

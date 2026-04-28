import { useState } from 'react'
import { postAnalysis } from '../../services/api'
import type { AnalysisCreateResponseDTO, ExpensesDTO } from '../../services/api'
import { getErrorMessage } from '../../services/http'

const CATEGORIES: { key: keyof ExpensesDTO; label: string; icon: string }[] = [
  { key: 'moradia',     label: 'moradia',     icon: '🏠' },
  { key: 'alimentacao', label: 'alimentação', icon: '🛒' },
  { key: 'transporte',  label: 'transporte',  icon: '🚗' },
  { key: 'saude',       label: 'saúde',       icon: '💊' },
  { key: 'lazer',       label: 'lazer',       icon: '🎮' },
  { key: 'educacao',    label: 'educação',    icon: '📚' },
  { key: 'dividas',     label: 'dívidas',     icon: '💳' },
  { key: 'outros',      label: 'outros',      icon: '📦' },
]

const emptyExpenses = (): ExpensesDTO => ({
  moradia: 0, alimentacao: 0, transporte: 0, saude: 0,
  lazer: 0, educacao: 0, dividas: 0, outros: 0,
})

interface Props {
  onResult: (res: AnalysisCreateResponseDTO) => void
}

export function AnalysisForm({ onResult }: Props) {
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState<ExpensesDTO>(emptyExpenses())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'income' | keyof ExpensesDTO, string>>>({})

  function validate(inc: number, exp: ExpensesDTO) {
    const next: Partial<Record<'income' | keyof ExpensesDTO, string>> = {}
    if (!inc || inc <= 0) next.income = 'Informe uma renda válida.'

    for (const { key } of CATEGORIES) {
      const value = exp[key]
      if (!Number.isFinite(value)) next[key] = 'Valor inválido.'
      else if (value < 0) next[key] = 'Não pode ser negativo.'
    }

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    const inc = parseFloat(income)
    setError('')
    if (!validate(inc, expenses)) return

    setLoading(true)

    try {
      const result = await postAnalysis(inc, expenses)
      onResult(result)
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Erro ao analisar. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  function setExp(key: keyof ExpensesDTO, val: string) {
    setExpenses(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
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
        {fieldErrors.income && <p className="error-msg">{fieldErrors.income}</p>}
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
              {fieldErrors[key] && <p className="error-msg">{fieldErrors[key]}</p>}
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

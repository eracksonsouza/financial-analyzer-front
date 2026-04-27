const BASE = import.meta.env.VITE_API_URL || ''

export interface Expenses {
  moradia: number
  alimentacao: number
  transporte: number
  saude: number
  lazer: number
  educacao: number
  dividas: number
  outros: number
}

export interface Metrics {
  income: number
  total_expenses: number
  balance: number
  savings_rate: number
  health_score: number
  expense_ratios: Record<string, number>
  rule_50_30_20: {
    needs_pct: number
    wants_pct: number
    debt_pct: number
  }
}

export interface AiResult {
  diagnostico: string
  melhorias: string[]
  score_label: string
}

export interface AnalysisResponse {
  id: number
  metrics: Metrics
  ai: AiResult
}

export interface HistoryItem {
  id: number
  income: number
  metrics: Metrics
  created_at: string
}

export async function postAnalysis(
  income: number,
  expenses: Expenses
): Promise<AnalysisResponse> {
  const res = await fetch(`${BASE}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ income, expenses }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${BASE}/api/analysis/history`)
  if (!res.ok) throw new Error('Erro ao carregar histórico')
  return res.json()
}

export async function getAnalysis(id: number): Promise<AnalysisResponse & { expenses: Expenses }> {
  const res = await fetch(`${BASE}/api/analysis/${id}`)
  if (!res.ok) throw new Error('Não encontrado')
  return res.json()
}

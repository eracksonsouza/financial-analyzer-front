export interface ExpensesDTO {
  moradia: number
  alimentacao: number
  transporte: number
  saude: number
  lazer: number
  educacao: number
  dividas: number
  outros: number
}

export interface MetricsDTO {
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

export interface AiResultDTO {
  diagnostico: string
  melhorias: string[]
  score_label: string
}

export interface AnalysisCreateResponseDTO {
  id: number
  metrics: MetricsDTO
  ai: AiResultDTO
}

export interface HistoryItemDTO {
  id: number
  income: number
  metrics: MetricsDTO
  created_at: string
}

export interface AnalysisShowResponseDTO {
  id: number
  income: number
  expenses: ExpensesDTO
  metrics: MetricsDTO
  ai: AiResultDTO
  created_at: string
}

export type TransactionTypeDTO = 'income' | 'expense' | 'investment'

export interface TransactionDTO {
  id: number
  title: string
  amount: number
  date: string
  type: TransactionTypeDTO
  created_at: string
}

export interface CreateTransactionDTO {
  title: string
  amount: number
  date: string
  type: TransactionTypeDTO
}

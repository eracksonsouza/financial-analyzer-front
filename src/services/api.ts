import { request } from './http'
import type {
  AnalysisCreateResponseDTO,
  AnalysisShowResponseDTO,
  CreateTransactionDTO,
  ExpensesDTO,
  HistoryItemDTO,
  TransactionDTO,
} from './types'

export type {
  AnalysisCreateResponseDTO,
  AnalysisShowResponseDTO,
  CreateTransactionDTO,
  ExpensesDTO,
  HistoryItemDTO,
  TransactionDTO,
  MetricsDTO,
  AiResultDTO,
} from './types'

// Aliases para compatibilidade com imports existentes no app
export type Expenses = ExpensesDTO
export type HistoryItem = HistoryItemDTO
export type Metrics = import('./types').MetricsDTO
export type AnalysisResponse = AnalysisCreateResponseDTO | AnalysisShowResponseDTO

export async function postAnalysis(income: number, expenses: ExpensesDTO): Promise<AnalysisCreateResponseDTO> {
  return request<AnalysisCreateResponseDTO>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify({ income, expenses }),
  })
}

export async function getHistory(): Promise<HistoryItemDTO[]> {
  return request<HistoryItemDTO[]>('/api/analysis/history')
}

export async function getAnalysis(id: number): Promise<AnalysisShowResponseDTO> {
  return request<AnalysisShowResponseDTO>(`/api/analysis/${id}`)
}

export async function listTransactions(month?: string): Promise<TransactionDTO[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  return request<TransactionDTO[]>(`/api/transactions${query}`)
}

export async function createTransaction(input: CreateTransactionDTO): Promise<TransactionDTO> {
  return request<TransactionDTO>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

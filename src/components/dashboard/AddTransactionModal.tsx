import { useEffect, useMemo, useState } from 'react'
import './AddTransactionModal.css'

export type TransactionType = 'income' | 'expense' | 'investment'

export interface TransactionEntry {
  id: string
  title: string
  date: string
  amount: number
  type: TransactionType
}

interface Props {
  open: boolean
  transactions?: TransactionEntry[]
  onClose: () => void
  onSave?: (items: TransactionEntry[]) => void
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Ganho',
  expense: 'Gasto',
  investment: 'Invest.',
}

const typeOrder: TransactionType[] = ['income', 'expense', 'investment']

export function AddTransactionModal({ open, transactions, onClose, onSave }: Props) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<TransactionType>('income')
  const [items, setItems] = useState<TransactionEntry[]>([])

  const isReady = title.trim() !== '' && amount.trim() !== '' && date.trim() !== ''

  useEffect(() => {
    if (!open) return
    setItems(transactions ?? [])
    setTitle('')
    setAmount('')
    setDate('')
    setType('income')
  }, [open, transactions])

  const parsedAmount = useMemo(() => parseAmount(amount), [amount])

  if (!open) return null

  function handleAdd() {
    if (!isReady || parsedAmount <= 0) return

    const newEntry: TransactionEntry = {
      id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
      title: title.trim(),
      date: formatDate(date),
      amount: parsedAmount,
      type,
    }

    setItems((prev) => [newEntry, ...prev])
    setTitle('')
    setAmount('')
    setDate('')
  }

  function handleSave() {
    onSave?.(items)
    onClose()
  }

  return (
    <div className="transaction-modal" onClick={onClose}>
      <div className="transaction-card" onClick={(event) => event.stopPropagation()}>
        <div className="transaction-title">Adicionar Transação</div>

        <div className="transaction-fields">
          <input
            className="transaction-input"
            placeholder="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="transaction-input"
            placeholder="Valor"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
          />
          <input
            className="transaction-input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div className="transaction-types">
          {typeOrder.map((value) => (
            <button
              key={value}
              type="button"
              className={`type-pill ${type === value ? 'active' : ''}`}
              onClick={() => setType(value)}
            >
              {typeLabels[value]}
            </button>
          ))}
        </div>

        <button className="transaction-add" type="button" onClick={handleAdd} disabled={!isReady}>
          Adicionar
        </button>

        <div className="transaction-list">
          {items.length === 0 && (
            <div className="transaction-empty">Sem transações adicionadas.</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="transaction-row">
              <span className={`transaction-dot transaction-dot--${item.type}`} />
              <div className="transaction-info">
                <div className="transaction-name">{item.title}</div>
                <div className="transaction-date">{item.date}</div>
              </div>
              <div
                className={`transaction-value ${item.type === 'expense' ? 'neg' : 'pos'}`}
              >
                {formatCurrency(item.amount)}
              </div>
            </div>
          ))}
        </div>

        <div className="transaction-actions">
          <button className="transaction-btn ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="transaction-btn primary" type="button" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

function parseAmount(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isNaN(parsed) ? 0 : parsed
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

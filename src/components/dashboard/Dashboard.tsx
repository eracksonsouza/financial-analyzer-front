import { useMemo, useState } from 'react'
import { BadgeDollarSign, PiggyBank, TrendingDown, Wallet } from 'lucide-react'
import type { HistoryItem, Metrics } from '../../services/api'
import type { TransactionEntry } from './AddTransactionModal'
import { AddTransactionModal } from './AddTransactionModal'
import { DonutChart } from '../charts/DonutChart'
import './Dashboard.css'

interface Props {
  history: HistoryItem[]
}

function fmt(value: number) {
  return 'R$ ' + value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

export function Dashboard({ history }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const sorted = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const latest = sorted[0]

  const metrics: Metrics = latest?.metrics ?? {
    income: 0,
    total_expenses: 0,
    balance: 0,
    savings_rate: 0,
    health_score: 0,
    expense_ratios: {
      moradia: 0,
      alimentacao: 0,
      transporte: 0,
      saude: 0,
      lazer: 0,
      educacao: 0,
      dividas: 0,
      outros: 0,
    },
    rule_50_30_20: {
      needs_pct: 0,
      wants_pct: 0,
      debt_pct: 0,
    },
  }

  const investments = Math.max(0, Math.round(metrics.balance * 0.5))

  const transactions = sorted.flatMap((item) => ([
    {
      label: `Renda (Análise #${item.id})`,
      date: formatDate(item.created_at),
      amount: item.income,
      type: 'income',
    },
    {
      label: `Gastos (Análise #${item.id})`,
      date: formatDate(item.created_at),
      amount: item.metrics.total_expenses,
      type: 'expense',
    },
  ]))

  const cards = [
    { label: 'Ganhos', value: metrics.income, icon: BadgeDollarSign, tone: 'positive' },
    { label: 'Gastos', value: metrics.total_expenses, icon: TrendingDown, tone: 'negative' },
    { label: 'Saldo', value: metrics.balance, icon: Wallet, tone: 'neutral' },
    { label: 'Investimentos', value: investments, icon: PiggyBank, tone: 'info' },
  ]

  const modalTransactions = useMemo<TransactionEntry[]>(() => {
    const today = formatDate(new Date().toISOString())
    const mapped: TransactionEntry[] = transactions.map((item, index) => ({
      id: `${item.label}-${index}`,
      title: item.label,
      date: item.date,
      amount: item.amount,
      type: item.type === 'expense' ? 'expense' : 'income',
    }))

    if (investments > 0) {
      mapped.unshift({
        id: `investment-${today}`,
        title: 'Investimento sugerido',
        date: today,
        amount: investments,
        type: 'investment',
      })
    }

    return mapped
  }, [investments, transactions])

  return (
    <div className="dashboard">
      {history.length === 0 && (
        <div className="dashboard-empty">Nenhuma análise disponível para o mês selecionado.</div>
      )}
      <div className="dashboard-stats">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`dashboard-card tone-${tone}`}>
            <div className="dashboard-card-title">{label}</div>
            <div className="dashboard-card-row">
              <div className="dashboard-card-value">{fmt(value)}</div>
              <div className="dashboard-card-icon">
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-lower">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Transações</div>
              <div className="panel-subtitle">Últimos lançamentos do mês</div>
            </div>
            <button className="panel-action" onClick={() => setIsAddOpen(true)}>+ adicionar</button>
          </div>

          <div className="panel-table">
            <div className="panel-row panel-row--head">
              <span>Título</span>
              <span>Data</span>
              <span>Quantidade</span>
            </div>
            {transactions.length === 0 && (
              <div className="panel-empty">Nenhum lançamento no mês selecionado.</div>
            )}
            {transactions.map((item) => (
              <div key={`${item.label}-${item.date}`} className="panel-row">
                <span className={`panel-dot panel-dot--${item.type}`} />
                <span>{item.label}</span>
                <span>{item.date}</span>
                <span className={item.type === 'expense' ? 'neg' : 'pos'}>{fmt(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel dashboard-panel--chart">
          <DonutChart metrics={metrics} />
        </div>
      </div>

      <AddTransactionModal
        open={isAddOpen}
        transactions={modalTransactions}
        onClose={() => setIsAddOpen(false)}
        onSave={() => setIsAddOpen(false)}
      />
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

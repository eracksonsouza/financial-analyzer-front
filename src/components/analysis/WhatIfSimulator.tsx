import { useMemo, useState } from 'react'
import { Home, ShoppingCart, Car, Gamepad2, CreditCard, Package } from 'lucide-react'
import type { Metrics } from '../../services/api'
import './WhatIfSimulator.css'

const CATEGORIES = [
  { key: 'moradia',     label: 'moradia',     Icon: Home },
  { key: 'alimentacao', label: 'alimentação', Icon: ShoppingCart },
  { key: 'transporte',  label: 'transporte',  Icon: Car },
  { key: 'lazer',       label: 'lazer',       Icon: Gamepad2 },
  { key: 'dividas',     label: 'dívidas',     Icon: CreditCard },
  { key: 'outros',      label: 'outros',      Icon: Package },
]

function computeScore(income: number, exp: Record<string, number>, balance: number): number {
  const savingsRate = income > 0 ? (balance / income) * 100 : 0
  let score = 100

  if      (savingsRate < 0)  score -= 40
  else if (savingsRate < 10) score -= 20
  else if (savingsRate < 20) score -= 10

  const debtPct    = income > 0 ? ((exp.dividas ?? 0) / income) * 100 : 0
  if      (debtPct > 30) score -= 25
  else if (debtPct > 20) score -= 15
  else if (debtPct > 10) score -= 5

  const housingPct = income > 0 ? ((exp.moradia ?? 0) / income) * 100 : 0
  if      (housingPct > 40) score -= 15
  else if (housingPct > 30) score -= 5

  return Math.max(0, Math.min(100, score))
}

function fmt(v: number) {
  return 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function fmtDelta(v: number) {
  return (v >= 0 ? '+' : '−') + ' ' + fmt(v)
}

interface Props { metrics: Metrics }

export function WhatIfSimulator({ metrics }: Props) {
  const income = metrics.income

  const base = useMemo(() =>
    Object.fromEntries(
      Object.entries(metrics.expense_ratios).map(([k, pct]) => [k, (pct / 100) * income])
    ), [metrics, income])

  const [cuts, setCuts] = useState<Record<string, number>>({})

  const simExp = useMemo(() =>
    Object.fromEntries(
      Object.entries(base).map(([k, v]) => [k, Math.max(0, v - (cuts[k] ?? 0))])
    ), [base, cuts])

  const totalExp   = Object.values(simExp).reduce((s, v) => s + v, 0)
  const newBalance = income - totalExp
  const newSavings = income > 0 ? (newBalance / income) * 100 : 0
  const newScore   = computeScore(income, simExp, newBalance)

  const dBalance = newBalance - metrics.balance
  const dScore   = newScore  - metrics.health_score

  const hasChanges = Object.values(cuts).some(v => v !== 0)

  function setCut(key: string, val: number) {
    setCuts(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="whatif-card">
      <div className="whatif-header">
        <span className="whatif-title">simulação "e se...?"</span>
        {hasChanges && (
          <button className="whatif-reset-btn" onClick={() => setCuts({})}>resetar</button>
        )}
      </div>
      <p className="whatif-desc">arraste para simular cortes e ver o impacto em tempo real</p>

      <div className="whatif-sliders">
        {CATEGORIES.map(({ key, label, Icon }) => {
          const orig = base[key] ?? 0
          if (orig < 1) return null
          const cut = cuts[key] ?? 0
          const pct = orig > 0 ? Math.round((cut / orig) * 100) : 0
          return (
            <div key={key} className="whatif-row">
              <div className="whatif-row-top">
                <span className="whatif-cat-label">
                  <Icon size={13} strokeWidth={1.5} />
                  {label}
                </span>
                <span className="whatif-row-numbers">
                  <span className="whatif-orig">{fmt(orig - cut)}</span>
                  {pct > 0 && <span className="whatif-cut-badge">−{pct}%</span>}
                </span>
              </div>
              <input
                type="range"
                className="whatif-slider"
                min={0}
                max={Math.round(orig)}
                value={Math.round(cut)}
                onChange={e => setCut(key, +e.target.value)}
              />
            </div>
          )
        })}
      </div>

      <div className="whatif-results">
        <div className="whatif-res-item">
          <span className="whatif-res-label">saldo</span>
          <span className={`whatif-res-value ${newBalance >= 0 ? 'good' : 'bad'}`}>{fmt(newBalance)}</span>
          {hasChanges && dBalance !== 0 && (
            <span className={`whatif-res-delta ${dBalance > 0 ? 'delta-positive' : 'delta-negative'}`}>
              {fmtDelta(dBalance)}/mês
            </span>
          )}
        </div>
        <div className="whatif-res-item">
          <span className="whatif-res-label">poupança</span>
          <span className={`whatif-res-value ${newSavings >= 20 ? 'good' : newSavings >= 5 ? 'warn' : 'bad'}`}>
            {newSavings.toFixed(1)}%
          </span>
        </div>
        <div className="whatif-res-item">
          <span className="whatif-res-label">score</span>
          <span className={`whatif-res-value ${newScore >= 70 ? 'good' : newScore >= 40 ? 'warn' : 'bad'}`}>
            {newScore}/100
          </span>
          {hasChanges && dScore !== 0 && (
            <span className={`whatif-res-delta ${dScore > 0 ? 'delta-positive' : 'delta-negative'}`}>
              {dScore > 0 ? `+${dScore}` : dScore} pts
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

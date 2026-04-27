import type { AnalysisResponse } from '../../services/api'
import { DonutChart } from '../charts/DonutChart'
import { HealthGauge } from '../charts/HealthGauge'
import { RuleCard } from './RuleCard'
import { SavingsProjection } from './SavingsProjection'
import { WhatIfSimulator } from './WhatIfSimulator'

function fmt(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function scoreClass(rate: number) {
  if (rate >= 20) return 'good'
  if (rate >= 5)  return 'warn'
  return 'bad'
}

interface Props {
  result: AnalysisResponse
  onReset: () => void
}

export function AnalysisResult({ result, onReset }: Props) {
  const { metrics, ai } = result

  return (
    <div className="result-enter">

      {/* Top: gauge + 2 metric cards */}
      <div className="result-top">
        <HealthGauge score={metrics.health_score} label={ai.score_label} />
        <div className="result-metric-stack">
          <div className="metric">
            <div className="metric-label">saldo mensal</div>
            <div className={`metric-value ${metrics.balance >= 0 ? 'good' : 'bad'}`}>
              {fmt(metrics.balance)}
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">taxa de poupança</div>
            <div className={`metric-value ${scoreClass(metrics.savings_rate)}`}>
              {metrics.savings_rate}%
            </div>
          </div>
        </div>
      </div>

      {/* Middle: donut + regra 50/30/20 */}
      <div className="result-mid">
        <DonutChart metrics={metrics} />
        <RuleCard rule={metrics.rule_50_30_20} />
      </div>

      {/* Projeção de poupança */}
      <SavingsProjection balance={metrics.balance} />

      {/* AI diagnostic */}
      <div className="ai-box">
        <div className="ai-header">
          <div className="ai-dot" />
          <div className="ai-label">diagnóstico por ia — {ai.score_label.toLowerCase()}</div>
        </div>
        <div className="ai-body">
          <p className="diagnosis">{ai.diagnostico}</p>
          <div className="improvements">
            {ai.melhorias.map((m, i) => (
              <div key={i} className="improvement">
                <span className="imp-num">0{i + 1}</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulador e se */}
      <WhatIfSimulator metrics={metrics} />

      <div className="footer-row">
        <button className="reset-btn" onClick={onReset}>← nova análise</button>
      </div>
    </div>
  )
}

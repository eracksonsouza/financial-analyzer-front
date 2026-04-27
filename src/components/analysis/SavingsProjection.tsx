import './SavingsProjection.css'

interface Props {
  balance: number
}

const RATE = 0.005

function fv(pmt: number, months: number) {
  return pmt * ((Math.pow(1 + RATE, months) - 1) / RATE)
}

function fmt(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

const PERIODS = [
  { months: 6,  label: '6 meses' },
  { months: 12, label: '1 ano' },
  { months: 24, label: '2 anos' },
]

export function SavingsProjection({ balance }: Props) {
  if (balance <= 0) return null

  return (
    <div className="projection-card">
      <div className="chart-title">projeção de poupança</div>
      <p className="projection-desc">mantendo o saldo de {fmt(balance)}/mês a 0,5% a.m.</p>
      <div className="projection-grid">
        {PERIODS.map(({ months, label }) => {
          const total    = fv(balance, months)
          const interest = total - balance * months
          return (
            <div key={months} className="projection-item">
              <div className="projection-period">{label}</div>
              <div className="projection-total">{fmt(total)}</div>
              <div className="projection-interest">+{fmt(interest)} em juros</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

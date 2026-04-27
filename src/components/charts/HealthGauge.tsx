import { useEffect, useState } from 'react'
import './HealthGauge.css'

interface Props {
  score: number
  label: string
}

const C_HALF = Math.PI * 80

function gaugeColor(score: number) {
  if (score >= 70) return 'var(--green)'
  if (score >= 40) return 'var(--amber)'
  return 'var(--red)'
}

export function HealthGauge({ score, label }: Props) {
  const [fill, setFill] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setFill(score), 80)
    return () => clearTimeout(t)
  }, [score])

  const color     = gaugeColor(score)
  const filledLen = (fill / 100) * C_HALF

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 120" width="200" height="120" aria-label={`Score ${score}/100`}>
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--red)"   stopOpacity="0.25" />
            <stop offset="40%"  stopColor="var(--amber)" stopOpacity="0.20" />
            <stop offset="70%"  stopColor="var(--green)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <path
          d="M 20 95 A 80 80 0 0 1 180 95"
          fill="none"
          stroke="url(#trackGrad)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        <path
          d="M 20 95 A 80 80 0 0 1 180 95"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filledLen} ${C_HALF}`}
          className="gauge-arc-fill"
        />

        <text
          x="100" y="68"
          textAnchor="middle"
          fill={color}
          fontSize="32"
          fontWeight="500"
          fontFamily="DM Mono, monospace"
          className="gauge-score-value"
        >
          {score}
        </text>

        <text x="100" y="85" textAnchor="middle" fill="var(--text-3)" fontSize="11" fontFamily="DM Mono, monospace">
          /100
        </text>

        <text x="100" y="110" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="DM Mono, monospace" letterSpacing="0.06em">
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  )
}

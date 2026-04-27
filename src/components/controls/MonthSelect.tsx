import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'

export interface MonthOption {
  key: string
  label: string
}

interface Props {
  value: string
  options: MonthOption[]
  onChange: (value: string) => void
}

export function MonthSelect({ value, options, onChange }: Props) {
  if (options.length === 0) return null

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[160px] rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-xs text-[var(--text)] shadow-none">
        <SelectValue className="truncate text-left" placeholder="Selecione o mês" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

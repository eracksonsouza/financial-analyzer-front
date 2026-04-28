import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const mountedRef = useRef(true)

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fn()
      if (!mountedRef.current) return
      setData(result)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err)
    } finally {
      if (!mountedRef.current) return
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    run()

    return () => {
      mountedRef.current = false
    }
  }, [run])

  return { data, error, loading, refetch: run }
}

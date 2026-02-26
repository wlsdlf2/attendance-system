import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type VisitorRow = {
  id: string
  date: string
  created_at: string
}

type DateSummary = {
  date: string
  members: string[]
  memberCount: number
  visitorCount: number
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'Z')
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
}

export default function AttendanceList() {
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState<DateSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: attendances, error: errA } = await supabase
          .from('attendances')
          .select(`
            id,
            date,
            created_at,
            members(name)
          `)
          .order('date', { ascending: false })

        if (errA) {
          setError(errA.message)
          setLoading(false)
          return
        }

        const { data: visitors, error: errV } = await supabase
          .from('visitors')
          .select('id, date, created_at')
          .order('date', { ascending: false })

        if (errV) {
          setError(errV.message)
          setLoading(false)
          return
        }

        const byDate = new Map<string, DateSummary>()

        const attList = (attendances ?? []) as unknown as Array<{
          id: string
          date: string
          created_at: string
          members?: { name: string } | null
          member?: { name: string } | null
        }>
        for (const a of attList) {
          const name = a.members?.name ?? a.member?.name ?? '(이름 없음)'
          if (!byDate.has(a.date)) {
            byDate.set(a.date, { date: a.date, members: [], memberCount: 0, visitorCount: 0 })
          }
          const s = byDate.get(a.date)!
          if (!s.members.includes(name)) s.members.push(name)
          s.memberCount = s.members.length
        }

        for (const v of visitors ?? []) {
          const row = v as VisitorRow
          if (!byDate.has(row.date)) {
            byDate.set(row.date, { date: row.date, members: [], memberCount: 0, visitorCount: 0 })
          }
          byDate.get(row.date)!.visitorCount += 1
        }

        setSummaries(Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date)))
      } catch {
        setError('데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const summariesByYear = summaries.filter((s) => new Date(s.date + 'Z').getFullYear() === selectedYear)
  const years = Array.from(
    new Set(summaries.map((s) => new Date(s.date + 'Z').getFullYear()))
  ).sort((a, b) => b - a)
  if (!years.includes(selectedYear)) {
    years.unshift(selectedYear)
    years.sort((a, b) => b - a)
  }

  if (loading) {
    return <p className="text-slate-500">불러오는 중…</p>
  }

  if (error) {
    return (
      <p className="text-red-600 bg-red-50 rounded-lg p-3">
        {error}
      </p>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-slate-800">주일별 출석 현황</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/attendance/grid"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            출석부(그리드) 보기
          </Link>
          <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">연도</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-800 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          </div>
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-4">
        주일을 클릭하면 해당 주일의 출석 상세를 볼 수 있습니다.
      </p>

      {summariesByYear.length === 0 ? (
        <p className="text-slate-600">
          {selectedYear}년 출석 기록이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {summariesByYear.map((s) => (
            <li key={s.date}>
              <Link
                to={`/dashboard/attendance/${s.date}`}
                className="block bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-primary/40 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-slate-800">
                    {formatDateShort(s.date)}
                  </span>
                  <span className="text-sm text-slate-500">
                    청년 <strong className="text-slate-700">{s.memberCount}</strong>명
                    {' · '}
                    방문자 <strong className="text-slate-700">{s.visitorCount}</strong>명
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type AttendanceRow = {
  id: string
  date: string
  created_at: string
  members?: { name: string } | null
  member?: { name: string } | null
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + 'Z')
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function AttendanceDetail() {
  const { date } = useParams<{ date: string }>()
  const [loading, setLoading] = useState(true)
  const [attendances, setAttendances] = useState<AttendanceRow[]>([])
  const [visitorCount, setVisitorCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: attData, error: errA } = await supabase
          .from('attendances')
          .select(`
            id,
            date,
            created_at,
            members(name)
          `)
          .eq('date', date)
          .order('created_at', { ascending: true })

        if (errA) {
          setError(errA.message)
          setLoading(false)
          return
        }

        const { count, error: errV } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true })
          .eq('date', date)

        if (errV) {
          setError(errV.message)
          setLoading(false)
          return
        }

        setAttendances((attData ?? []) as AttendanceRow[])
        setVisitorCount(count ?? 0)
      } catch {
        setError('데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [date])

  if (!date) {
    return (
      <p className="text-slate-600">
        <Link to="/dashboard/attendance" className="text-primary hover:text-primary-dark">
          주일별 출석 현황
        </Link>
        으로 돌아가기
      </p>
    )
  }

  if (loading) {
    return <p className="text-slate-500">불러오는 중…</p>
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>
        <Link to="/dashboard/attendance" className="text-primary hover:text-primary-dark text-sm">
          ← 주일별 출석 현황
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/dashboard/attendance"
        className="inline-block text-sm text-slate-500 hover:text-primary mb-4"
      >
        ← 주일별 출석 현황
      </Link>
      <h2 className="text-xl font-semibold text-slate-800 mb-1">
        {formatDateFull(date)}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        청년 {attendances.length}명 · 방문자 {visitorCount}명
      </p>

      <section className="mb-6">
        <h3 className="text-sm font-medium text-slate-600 mb-2">출석 청년 ({attendances.length}명)</h3>
        {attendances.length === 0 ? (
          <p className="text-slate-500 text-sm">출석한 청년이 없습니다.</p>
        ) : (
          <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {attendances.map((a, i) => (
              <li
                key={a.id}
                className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
              >
                <span className="font-medium text-slate-800">
                  {a.members?.name ?? a.member?.name ?? '(이름 없음)'}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTime(a.created_at)} 체크인
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {visitorCount > 0 && (
        <section>
          <h3 className="text-sm font-medium text-slate-600 mb-2">방문자 ({visitorCount}명)</h3>
          <p className="text-slate-500 text-sm">
            해당 주일에 방문자로 등록된 분이 {visitorCount}명 있습니다.
          </p>
        </section>
      )}
    </div>
  )
}

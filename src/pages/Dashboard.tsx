import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { replace: true })
        return
      }
      setLoading(false)
    })
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">확인 중…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">대시보드</h1>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-primary hover:text-primary-dark"
        >
          로그아웃
        </button>
      </header>
      <main className="p-4 sm:p-6 max-w-4xl mx-auto">
        <p className="text-slate-600">
          주일별 출석 현황, 청년 명단, 통계 등은 Phase 3·4에서 구성 예정입니다.
        </p>
      </main>
    </div>
  )
}

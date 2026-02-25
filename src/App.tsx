import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('연결 확인 중...')

  useEffect(() => {
    supabase.from('members').select('*').then(({ data, error }) => {
      if (error) {
        setStatus('❌ 연결 실패: ' + error.message)
      } else {
        setStatus('✅ Supabase 연결 성공! (데이터 수: ' + data.length + ')')
      }
    })
  }, [])

  return (
    <div style={{ padding: 40, fontSize: 24 }}>
      {status}
    </div>
  )
}

export default App
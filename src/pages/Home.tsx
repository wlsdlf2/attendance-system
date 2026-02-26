import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-2">
          젊은백성 출결관리
        </h1>
        <p className="text-slate-600 text-center mb-8">관리자 로그인 또는 출석체크 화면으로 이동</p>

        {/* 대시보드(PC)용 — 기본 강조 */}
        <Link
          to="/login"
          className="block w-full py-4 px-6 rounded-xl bg-primary text-white text-lg font-semibold text-center hover:bg-primary-dark active:scale-[0.99] mb-4 shadow-sm"
        >
          대시보드 로그인
        </Link>

        {/* 출석체크(태블릿)용 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <Link
            to="/checkin"
            className="block w-full py-3 px-4 rounded-lg bg-primary text-white text-center font-medium hover:bg-primary-dark active:scale-[0.99] mb-3"
          >
            출석체크 화면으로 이동
          </Link>
          <p className="text-sm text-slate-500 text-center">
            태블릿에서는 위 버튼으로 출석체크 화면을 연 뒤, 브라우저 메뉴에서
            <strong className="text-slate-700"> 「홈 화면에 추가」</strong> 또는
            <strong className="text-slate-700"> 「앱으로 설치」</strong>를 선택해 두고 사용하세요.
          </p>
        </div>
      </div>
    </div>
  )
}

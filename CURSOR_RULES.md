# 젊은백성 출결관리 서비스 — Cursor 프로젝트 룰

## 프로젝트 개요
교회 청년부(젊은백성)의 주일 출결을 관리하는 웹 서비스.
- **출석체크 화면**: 예배당 입구 태블릿에 설치, 청년들이 직접 출석 체크
- **관리자 대시보드**: PC에서 사역자/임원이 출석 현황 관리 및 분석

---

## 기술 스택
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend/DB**: Supabase (PostgreSQL + Auth + API)
- **배포**: Vercel
- **라우터**: react-router-dom
- **차트**: recharts
- **Excel export**: xlsx

---

## URL 구조
| 경로 | 화면 | 대상 |
|------|------|------|
| `/checkin` | 출석체크 화면 | 태블릿 (인증 불필요) |
| `/login` | 로그인 | 관리자/임원 |
| `/dashboard` | 대시보드 홈 | 관리자/임원 (로그인 필요) |
| `/dashboard/attendance` | 주일별 출석 현황 | 관리자/임원 |
| `/dashboard/members` | 청년 명단 관리 | 관리자/임원 |
| `/dashboard/members/:id` | 개인 출석 이력 | 관리자/임원 |
| `/dashboard/stats` | 통계 및 그래프 | 관리자/임원 |

---

## 폴더 구조
```
src/
├── lib/
│   └── supabase.ts           # Supabase 클라이언트 (이미 생성됨)
├── pages/
│   ├── CheckIn.tsx           # 출석체크 화면 (태블릿)
│   ├── Login.tsx             # 대시보드 로그인
│   ├── Dashboard.tsx         # 대시보드 홈
│   ├── AttendanceList.tsx    # 주일별 출석 현황
│   ├── MemberList.tsx        # 청년 명단 관리
│   ├── MemberDetail.tsx      # 개인 출석 이력
│   └── Stats.tsx             # 통계 및 그래프
├── components/
│   ├── Keypad.tsx            # 숫자 키패드 컴포넌트
│   ├── AbsentAlert.tsx       # 연속 결석자 알림 배너
│   └── Navbar.tsx            # 대시보드 네비게이션
├── App.tsx                   # 라우터 설정
└── main.tsx                  # 진입점
```

---

## DB 스키마 (Supabase / PostgreSQL)

### members — 청년 명단
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | 자동 생성 |
| name | TEXT NOT NULL | 청년 이름 |
| phone | TEXT NOT NULL UNIQUE | 전화번호 전체 (예: 010-1234-5678) |
| birth_date | DATE | 생년월일 |
| is_new_member | BOOLEAN NOT NULL DEFAULT true | 새가족 여부. 등반 후 false로 변경 |
| memo | TEXT | 비고 |
| created_at | TIMESTAMPTZ DEFAULT NOW() | 등록일시 |

### attendances — 주일 출석 기록
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | 자동 생성 |
| member_id | UUID FK → members.id | 출석한 청년 |
| date | DATE NOT NULL | 주일 날짜 |
| created_at | TIMESTAMPTZ DEFAULT NOW() | 체크인 시각 |

- UNIQUE(member_id, date) — 같은 날 중복 출석 방지
- member_id ON DELETE CASCADE

### visitors — 방문자 기록
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | 자동 생성 |
| date | DATE NOT NULL | 방문 주일 날짜 |
| created_at | TIMESTAMPTZ DEFAULT NOW() | 체크인 시각 |

### users — 대시보드 계정 (Supabase Auth 연동)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | Supabase auth.uid()와 동일 |
| email | TEXT NOT NULL UNIQUE | 로그인 이메일 |
| role | TEXT NOT NULL DEFAULT 'staff' | 'admin' 또는 'staff' |
| created_at | TIMESTAMPTZ DEFAULT NOW() | 가입일시 |

---

## 핵심 비즈니스 로직

### 출석체크 화면 플로우
1. 전화번호 뒷 4자리 입력
2. `members` 테이블에서 `phone`이 해당 4자리로 끝나는 청년 조회
3. **1명만 매칭** → 바로 출석 처리
4. **2명 이상 매칭** → 이름 목록 표시 → 본인 선택 → 출석 처리
5. **0명 매칭** → 방문자 버튼 표시 → visitors 테이블에 기록
6. 출석 처리 후 이름과 함께 완료 메시지 (2~3초 후 초기화)
7. 이미 오늘 출석한 경우 → 중복 안내 메시지 표시

### 연속 결석자 알림
- 최근 3주 연속 결석 시 대시보드 홈 상단에 알림 표시
- 표시 정보: 이름, 마지막 출석일, 연속 결석 주수

### 새가족 구분
- `is_new_member = true` 인 청년은 대시보드에서 별도 구분 표시 (뱃지 등)
- 등반 후 관리자가 수동으로 `false`로 변경

---

## 개발 규칙

### 코딩 컨벤션
- 언어: TypeScript (strict 모드)
- 스타일: Tailwind CSS v4만 사용 (인라인 style 지양)
- 컴포넌트: 함수형 컴포넌트 + React Hooks
- Supabase 호출은 항상 `try/catch` 또는 `{ data, error }` 구조로 에러 처리

### Tailwind CSS v4 주의사항
- `tailwind.config.js` 없음 — `@tailwindcss/vite` 플러그인 방식 사용
- `src/index.css`에 `@import "tailwindcss"` 한 줄만 있음

### Supabase 클라이언트
```typescript
// 항상 이렇게 import해서 사용
import { supabase } from '../lib/supabase'
```

### 환경변수
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 개발 단계 (Phase)
- **Phase 1**: 기반 세팅 ✅ 완료
- **Phase 2**: 출석체크 화면 (`/checkin`) ← 현재 단계
- **Phase 3**: 대시보드 기본 (로그인, 주일별 현황, 청년 명단 CRUD)
- **Phase 4**: 심화 기능 (개인 이력, 통계 그래프, 결석자 알림)
- **Phase 5**: Excel/CSV export, UI 다듬기, 실사용 테스트

---

## 출석체크 키패드 UI 스펙

### 레이아웃
아이폰 다이얼 스타일 숫자 키패드. 3열 4행 구성.

```
[ 1 ] [ 2 ] [ 3 ]
[ 4 ] [ 5 ] [ 6 ]
[ 7 ] [ 8 ] [ 9 ]
[ 빈칸 ] [ 0 ] [  ←(삭제) ]
```

### 버튼 스타일
- 배경: 흰색 (bg-white), 둥근 모서리
- 숫자: 크고 굵게 (상단)
- 알파벳: 작게 (숫자 아래 서브텍스트)
- 전체 배경: 연한 회색 (bg-gray-200)
- 그림자 또는 테두리로 입체감 표현
- 버튼 크기: 태블릿 터치에 충분히 크게 (최소 80px 높이)
- 맨 아래 왼쪽 셀: 빈 칸 (버튼 없음)
- 삭제 버튼(←): 오른쪽 하단, 아이콘으로 표시

### 입력 표시
- 키패드 위에 입력된 숫자를 크게 표시
- 4자리 입력 완료 시 자동으로 조회 실행
- 입력 자리수: ● ● ● ● 형태 또는 숫자 직접 표시
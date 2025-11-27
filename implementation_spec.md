# ClassStock 구현 명세서 (Implementation Specification)

본 문서는 `ClassStock` 애플리케이션의 현재 코드를 기반으로, 전체 구조, 상태 관리, 컴포넌트별 기능 및 로직을 상세하게 기술한 문서입니다. 이를 통해 다른 환경이나 플랫폼에서 동일한 기능을 구현할 수 있도록 정보를 제공합니다.

---

## 1. 프로젝트 개요 및 기술 스택

- **프로젝트명**: ClassStock
- **목적**: 학급용 모의투자 교육 웹 애플리케이션
- **Frontend**: React (TypeScript)
- **Styling**: CSS Modules (in `index.html` style tag), CSS Variables for theming
- **Data Persistence**: React Local State (Primary), Local Storage (Auxiliary for timestamps)
- **Icons/Fonts**: SVG Icons, Gmarket Sans (Self-hosted via CDN)

---

## 2. 파일 및 디렉토리 구조

```
/
├── index.html              # 전역 스타일(CSS) 및 진입점
├── index.tsx               # React Root 렌더링
├── src/
│   ├── App.tsx             # 메인 앱 로직, 상태 관리, 라우팅
│   ├── types.ts            # TypeScript 인터페이스 및 타입 정의
│   ├── data.ts             # 초기 Mock 데이터 (주식, 공지 등)
│   ├── components/
│   │   ├── landing/        # 랜딩 페이지 관련 컴포넌트 (로그인, 헤더 등)
│   │   ├── teacher/        # 교사 대시보드, 학급 관리, 학생 포트폴리오
│   │   ├── student/        # 학생 대시보드, 트레이딩, 차트
│   │   ├── admin/          # 관리자 대시보드 (공지, Q&A 관리)
│   │   ├── public/         # 공지사항, Q&A 게시판 (공용)
│   │   └── shared/         # 재사용 컴포넌트 (Toast, Modal, Ranking)
```

---

## 3. 전역 상태 관리 (`src/App.tsx`)

애플리케이션은 `App.tsx`에서 중앙 집중식으로 상태를 관리하며, 필요한 컴포넌트에 Props로 전달하는 구조를 가집니다.

### 3.1. 주요 상태 (State)
- **View Navigation**: `view` ('landing' | 'teacher_dashboard' | 'student_dashboard' | ... )
- **Data Stores**:
  - `stocks`: 주식 종목 및 현재가 데이터
  - `classes`: 생성된 학급 정보
  - `students`: 학생 정보, 자산, 포트폴리오
  - `transactions`: 전체 거래 내역 (매수/매도/보너스)
  - `notices`, `popupNotices`, `qnaPosts`: 게시판 데이터
- **User Session**:
  - `isTeacherLoggedIn`, `currentTeacherEmail`
  - `isAdminLoggedIn`
  - `currentStudentId`, `selectedClassId`

### 3.2. 핵심 로직
1.  **자동 주가 업데이트 (Auto Price Update)**
    - `useEffect`를 사용하여 앱 실행 시 체크.
    - 한국 시간(KST) 기준 **16시 10분** 이후 최초 접속 시 1일 1회 주가 변동 로직 실행.
    - `localStorage`에 `lastUpdateDate`를 저장하여 중복 실행 방지.
    - 변동 폭: -4.5% ~ +5.5% 사이의 랜덤 등락.

2.  **라우팅 및 뷰 전환**
    - 조건부 렌더링(`switch(view)`)을 통해 SPA(Single Page Application)처럼 동작.

---

## 4. 컴포넌트 별 기능 상세

### 4.1. 랜딩 페이지 (`landing/`)
- **`LandingPage.tsx`**:
    - 앱의 메인 진입점.
    - **기능**: 포토 캐러셀(갤러리), 주요 기능 소개, FAQ, 푸터(이용약관/개인정보처리방침).
    - **히든 관리자 로그인**: 별도의 버튼 없이 `TeacherLoginModal`을 통해 접근.
- **`TeacherLoginModal.tsx`**:
    - **교사 로그인**: 이메일/비밀번호 입력 시 `onLoginSuccess` 호출.
    - **관리자 로그인 트리거**: 이메일 `admin@classstock.com`, 비밀번호 `admin` 입력 시 `onAdminLogin`을 호출하여 관리자 모드로 진입.
- **`StudentLoginModal.tsx`**:
    - 참여 코드와 이름을 입력받아 `onStudentJoin` 호출 (별도 가입 절차 없음).
- **`PopupNoticeModal.tsx`**:
    - `App.tsx`에서 날짜 및 로컬 스토리지 기록을 확인하여 유효한 팝업 공지가 있을 경우 렌더링.
    - "오늘 하루 닫기" 기능 구현.

### 4.2. 교사 기능 (`teacher/`)
- **`TeacherDashboard.tsx`**:
    - 생성된 학급 목록 카드 뷰 제공.
    - 학급 생성(`CreateClassModal`) 및 삭제 기능.
    - 학급 생성 제한: 최대 2개.
- **`ClassDetailView.tsx`**:
    - 4개의 탭으로 구성:
        1.  **기본 정보**: 참여 코드 확인/복사.
        2.  **학생 관리**: 학생 목록, 일괄 등록(`BulkRegisterModal`), 선택/전체 보너스 지급(`BonusModal`), 학생 삭제.
        3.  **포트폴리오**: 전체 학생의 자산 및 수익률 카드 뷰. 클릭 시 상세(`StudentPortfolioModal`) 조회.
        4.  **랭킹 보드**: 자산순/수익률순 정렬 가능한 랭킹 리스트.
- **`CreateClassModal.tsx`**:
    - 학급명, 기간, 시드머니, 수수료율 설정.
    - 유효성 검사: 종료일이 시작일보다 앞설 수 없음.

### 4.3. 학생 기능 (`student/`)
- **`StudentDashboard.tsx`**:
    - **상단**: 활동 상태(활동 전/중/종료), 실시간 정보 링크(네이버 증권), 용어 사전.
    - **자산 요약**: 총 자산, 수익금, 수익률 시각화.
    - **탭 인터페이스**:
        1.  **포트폴리오**: 파이 차트(자산 구성), 보유 종목 카드 리스트(평가손익 포함).
        2.  **마켓**: 주식 목록, 현재가, 매수/매도 버튼. 클릭 시 차트 모달(`StockInfoModal`).
        3.  **거래 내역**: 시간순 거래 및 보너스 기록.
        4.  **랭킹**: 학급 내 순위 확인.
- **`TradeModal.tsx`**:
    - 매수/매도 주문 처리.
    - 수수료 계산 로직 포함 (`주문금액 * 수수료율`).
    - 보유 현금(매수) 또는 보유 수량(매도) 초과 시 주문 불가 처리.
- **`StockInfoModal.tsx` & `StockChart.tsx`**:
    - 현재가를 기준으로 가상의 과거 10일치 데이터를 생성하여 꺾은선 그래프 렌더링.
    - 학생이 해당 종목 보유 시, 차트에 '평단가' 라인 표시.

### 4.4. 관리자 기능 (`admin/`)
- **`AdminDashboard.tsx`**:
    - 3개의 탭으로 콘텐츠 관리.
    1.  **공지사항 관리**: 생성, 수정, 삭제.
    2.  **Q&A 관리**: 전체 질문 조회, 답변 등록/수정, 삭제.
    3.  **팝업 공지 관리**: 팝업 생성(기간 설정), 수정, 삭제.
- **데이터 흐름**: 관리자 액션은 `App.tsx`의 상태 변경 함수(`onSaveNotice` 등)를 호출하여 전역 상태를 업데이트함.

### 4.5. 공용 게시판 (`public/`)
- **`QnABoard.tsx`**:
    - 교사는 질문 등록 가능 (비밀글 옵션 지원).
    - 학생/비로그인 사용자는 목록 조회만 가능할 수 있음 (현재 구현상 접근 권한 제어는 `App.tsx` 라우팅 레벨에서 처리).
    - 비밀글 로직: 작성자 본인(이메일 대조) 또는 관리자만 내용 확인 가능.

---

## 5. 데이터 모델 (Types)

`types.ts`에 정의된 주요 인터페이스:
- **`Stock`**: 종목 코드, 이름, 현재가, 섹터, 설명.
- **`ClassInfo`**: 학급 ID, 이름, 기간, 시드머니, 수수료 설정.
- **`StudentInfo`**: 학생 ID, 닉네임, 학급ID, 현금, 포트폴리오(`PortfolioItem[]`).
- **`Transaction`**: 거래 내역 (유형: buy/sell/bonus).
- **`Notice`, `QnAPost`, `PopupNotice`**: 게시판 데이터 구조.

---

## 6. 스타일링 및 디자인 시스템

`index.html` 내 `<style>` 태그에 정의됨.

- **Color Palette**:
    - Primary (Teacher): `#0B6623` (Green)
    - Secondary (Student): `#B29146` (Gold/Brown)
    - Positive (Profit): `#c62828` (Red)
    - Negative (Loss): `#1565c0` (Blue)
- **Typography**: `Gmarket Sans` (Light/Medium/Bold).
- **Components**:
    - `.button`: 그라디언트 및 쉐도우 효과가 적용된 공통 버튼 스타일.
    - `.card`, `.modal`: 통일된 보더 라디우스(`12px`) 및 그림자 효과.
    - **Responsive**: 미디어 쿼리를 사용하여 모바일(`max-width: 480px`) 대응 (그리드 레이아웃 변경 등).

---

## 7. 특이 사항 및 확장 가이드

1.  **데이터 지속성**: 현재는 새로고침 시 데이터가 초기화됩니다. 실제 서비스 배포 시 `src/App.tsx`의 상태 관리 로직을 Firebase 등의 DB 연동 로직으로 교체해야 합니다.
2.  **인증**: 현재 `TeacherLoginModal`의 구글 로그인 버튼은 UI만 구현되어 있으며, 실제 인증은 더미 데이터로 처리됩니다.
3.  **보안**: 클라이언트 측에서 비밀번호 검증(`admin` 등)을 수행하므로, 프로덕션 환경에서는 서버 사이드 검증으로 변경이 필요합니다.

---

## 8. 배포 및 실행 시 유의사항 (Deployment & Execution Notes)

이 코드를 다른 환경에서 실행할 때 다음 사항을 반드시 확인해야 합니다.

### 8.1. 이미지 에셋 (Image Assets)
- **요구사항**: 소스 코드(`src/components/landing/LandingPage.tsx`)는 다음 경로의 이미지 파일을 참조합니다.
  - `assets/logo.png`
  - `assets/background.png`
  - `assets/gallery-1.png` ~ `assets/gallery-5.png`
- **조치 필요**: 해당 경로에 실제 이미지 파일이 없으면 화면에 이미지가 나타나지 않습니다(Broken Image). 실행 전 적절한 플레이스홀더(Placeholder) 이미지나 실제 리소스를 `public/assets` 폴더에 위치시켜야 합니다.

### 8.2. React 버전 호환성
- **현재 설정**: `index.html`의 importmap은 **React 19.1.1 (Canary)** 버전을 사용하도록 설정되어 있습니다.
- **유의사항**: React 18 이하 환경(일반적인 Create React App, Vite 기본 설정 등)에서 실행 시 `react-dom/client`의 타입 정의나 일부 Hook 동작에 차이가 있을 수 있습니다. 가능하면 최신 React 환경을 사용하거나 버전을 맞추는 것이 좋습니다.

### 8.3. 외부 폰트 의존성
- **설정**: `index.html` CSS에서 `cdn.jsdelivr.net`을 통해 'Gmarket Sans' 폰트를 로드합니다.
- **유의사항**: 실행 환경이 폐쇄망(Private Network)이거나 인터넷 연결이 없는 경우 폰트가 기본 시스템 폰트로 대체되어 UI 디자인이 달라 보일 수 있습니다. 인터넷 연결이 가능한 환경에서 실행해야 합니다.
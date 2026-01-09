# ClassStock 배포 가이드

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [Firebase 프로젝트 설정](#firebase-프로젝트-설정)
3. [로컬 개발 환경](#로컬-개발-환경)
4. [Docker 배포](#docker-배포)
5. [Firebase Hosting 배포](#firebase-hosting-배포)
6. [CI/CD 파이프라인](#cicd-파이프라인)
7. [환경 변수](#환경-변수)
8. [보안 설정](#보안-설정)

---

## 사전 요구사항

- Node.js 20.x 이상
- npm 또는 yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Docker (선택사항)
- Google Cloud 계정

---

## Firebase 프로젝트 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. 프로젝트 설정 > 일반 > 웹 앱 추가
3. Firebase SDK 설정 값 복사

### 2. Firebase 서비스 활성화

Firebase Console에서 다음 서비스를 활성화:

- **Authentication**
  - 이메일/비밀번호 로그인 활성화
  - Google 로그인 활성화 (선택사항)

- **Firestore Database**
  - 프로덕션 모드로 생성
  - 아시아 리전 선택 (asia-northeast3 권장)

- **Storage**
  - 파일 첨부 기능용

- **Hosting**
  - 웹 앱 배포용

### 3. Firestore 보안 규칙 배포

```bash
firebase login
firebase use --add  # 프로젝트 선택
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

---

## 로컬 개발 환경

### 1. 환경 변수 설정

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# .env.local 파일 편집하여 Firebase 설정 값 입력
```

### 2. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

### 3. 테스트 실행

```bash
# 단일 실행
npm run test:run

# 감시 모드
npm run test

# 커버리지 포함
npm run test:coverage
```

---

## Docker 배포

### 개발 환경

```bash
# 개발 서버 실행 (핫 리로드 지원)
docker-compose --profile dev up classstock-dev
```

### 프로덕션 빌드

```bash
# 환경 변수 설정
export VITE_FIREBASE_API_KEY=your_api_key
export VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
export VITE_FIREBASE_PROJECT_ID=your_project_id
export VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
export VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
export VITE_FIREBASE_APP_ID=your_app_id

# 빌드 및 실행
docker-compose up -d classstock

# 로그 확인
docker-compose logs -f classstock
```

### 수동 Docker 빌드

```bash
docker build \
  --build-arg VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
  --build-arg VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
  --build-arg VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
  -t classstock:latest .

docker run -d -p 3000:80 classstock:latest
```

---

## Firebase Hosting 배포

### 수동 배포

```bash
# 빌드
npm run build

# Firebase에 배포
firebase deploy --only hosting
```

### 미리보기 채널 배포

```bash
firebase hosting:channel:deploy preview
```

---

## CI/CD 파이프라인

### GitHub Secrets 설정

GitHub 저장소 Settings > Secrets and variables > Actions에서 다음 시크릿 추가:

| Secret Name | 설명 |
|------------|------|
| `VITE_FIREBASE_API_KEY` | Firebase API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 발신자 ID |
| `VITE_FIREBASE_APP_ID` | Firebase 앱 ID |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 서비스 계정 JSON |

### Firebase 서비스 계정 생성

1. Firebase Console > 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. 다운로드된 JSON 파일 내용을 `FIREBASE_SERVICE_ACCOUNT` 시크릿에 저장

### 워크플로우 동작

- **PR 생성/업데이트**: 테스트 실행 + 미리보기 배포
- **main 브랜치 푸시**: 테스트 실행 + 프로덕션 배포

---

## 환경 변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase Cloud Messaging 발신자 ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase 앱 ID |

---

## 보안 설정

### Firebase 보안 규칙

- `firestore.rules`: Firestore 데이터 접근 규칙
- `storage.rules`: Storage 파일 접근 규칙

### 주요 보안 정책

1. **인증 필수**: 대부분의 쓰기 작업에 인증 필요
2. **소유권 검증**: 교사는 자신의 학급만 관리 가능
3. **관리자 권한**: admin@classstock.com 계정만 공지사항 관리 가능
4. **공개 읽기**: 공지사항, 랭킹 등은 인증 없이 읽기 가능

### 프로덕션 전 체크리스트

- [ ] Firebase 보안 규칙 배포 확인
- [ ] 관리자 계정 비밀번호 변경
- [ ] HTTPS 설정 확인
- [ ] 도메인 설정 (Firebase Hosting 커스텀 도메인)
- [ ] 에러 모니터링 설정 (Firebase Crashlytics 등)
- [ ] 백업 정책 설정

---

## 문제 해결

### 빌드 실패

```bash
# 캐시 삭제 후 재빌드
rm -rf node_modules dist
npm install
npm run build
```

### Firebase 연결 실패

1. 환경 변수가 올바르게 설정되었는지 확인
2. Firebase 프로젝트 ID가 일치하는지 확인
3. Firebase 서비스가 활성화되었는지 확인

### Docker 빌드 문제

```bash
# Docker 캐시 삭제
docker builder prune -f
docker-compose build --no-cache
```

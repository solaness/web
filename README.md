# 🌞 Solaness

> 나의 기분에 맞는, 나만의 힐링스팟

Solaness는 감정 상태와 실시간 환경(날씨·일조량)을 기반으로 사용자에게 맞는 힐링 장소를 추천해주는 반응형 모바일 웹앱입니다. WBTI(웰니스 유형 검사)를 통해 나만의 웰니스 유형을 알아보고, 감정 기반 추천으로 나에게 맞는 공간을 찾고, 방문 기록을 통해 나의 웰니스 활동을 기록/관리할 수 있습니다.

<!-- 공모전명, 제출 정보 등 필요하면 여기 추가 -->

<br>

## 🛠 기술 스택

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)

| 분야 | 스택 |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS v4, React Router |
| Backend | Firebase (Authentication, Firestore, Storage, Hosting) |
| External API | 한국관광공사 공공데이터 API |  

<br>

## 📁 폴더 구조

```
src/
  pages/          # 화면 단위 컴포넌트 (라우트에 연결)
    onboarding/
    map/
    history/
    my/
  components/     # 재사용 UI 컴포넌트
    layout/
    onboarding/
    home/
    map/
    history/
    my/
    chatbot/
    shared/
  firebase/       # Firebase 설정 및 연동 함수
  hooks/          # 커스텀 훅
  types/          # TypeScript 타입 정의
  App.tsx
  main.tsx
```

<br>

## 🚀 실행 방법

1. 저장소 클론
   ```bash
   git clone [저장소 URL]
   cd solaness
   ```

2. 패키지 설치
   ```bash
   npm install
   ```

3. 환경변수 설정
   - 프로젝트 루트에 `.env` 파일 생성
   - `.env.example` 참고해서 Firebase config 값 채우기 (팀 내부 공유)

4. 개발 서버 실행
   ```bash
   npm run dev
   ```
   → `http://localhost:5173` 접속

### 요구 사항
- Node.js 18 이상

<br>

## 🌿 Git 브랜치 전략 / 커밋 컨벤션

[GIT_FLOW.md](./GIT_FLOW.md) 참고

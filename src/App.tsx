import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import RequireAuth from './components/shared/RequireAuth'
import MainLayout from './components/layout/MainLayout'

import Splash from './pages/onboarding/Splash'
import Intro from './pages/onboarding/Intro'
import Login from './pages/onboarding/Login'
import Region from './pages/onboarding/Region'
import Test1 from './pages/onboarding/Test1'
import Test2 from './pages/onboarding/Test2'
import Test3 from './pages/onboarding/Test3'
import Result from './pages/onboarding/Result'

import Home from './pages/Home'
import MapSearch from './pages/map/MapSearch'
import MapDetail from './pages/map/MapDetail'
import Chatbot from './pages/Chatbot'

import HistoryMain from './pages/history/HistoryMain'
import Calendar from './pages/history/Calendar'
import Visits from './pages/history/Visits'

import MyMain from './pages/my/MyMain'
import EditProfile from './pages/my/EditProfile'
import EditAvatar from './pages/my/EditAvatar'
import Favorites from './pages/my/Favorites'
import EditWbtiStep from './pages/my/edit/EditWbtiStep'
import EditWbtiResult from './pages/my/edit/EditWbtiResult'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />

          <Route path="/onboarding/intro" element={<Intro />} />
          <Route path="/onboarding/login" element={<Login />} />

          {/* 지역 선택 ~ 결과 화면만 지역/WBTI 진행 상태를 공유해야 해서 OnboardingProvider로 감싼다.
              intro/login은 이 상태를 안 쓰므로 범위 밖에 둔다. */}
          <Route
            element={
              <OnboardingProvider>
                <Outlet />
              </OnboardingProvider>
            }
          >
            <Route path="/onboarding/region" element={<Region />} />
            <Route path="/onboarding/test/1" element={<Test1 />} />
            <Route path="/onboarding/test/2" element={<Test2 />} />
            <Route path="/onboarding/test/3" element={<Test3 />} />
            <Route path="/onboarding/result" element={<Result />} />
          </Route>

          <Route
            path="/chatbot"
            element={
              <RequireAuth>
                <Chatbot />
              </RequireAuth>
            }
          />

          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route path="/home" element={<Home />} />

            <Route path="/map" element={<MapSearch />} />
            <Route path="/map/:id" element={<MapDetail />} />

            <Route path="/history" element={<HistoryMain />} />
            <Route path="/history/calendar" element={<Calendar />} />
            <Route path="/history/visits" element={<Visits />} />

            <Route path="/my" element={<MyMain />} />
            <Route path="/my/edit" element={<EditProfile />} />
            <Route path="/my/edit/avatar" element={<EditAvatar />} />
            <Route path="/my/favorites" element={<Favorites />} />
          </Route>

          {/* 지역 수정 / WBTI 재검사: 온보딩 Region·Test·Result와 화면 컴포넌트는 공유하지만,
              진행 상태(세션스토리지)는 storageNamespace로 분리한다 — 안 그러면 온보딩을 하다 만
              사용자의 답변이 재검사 화면에 그대로 프리필되거나, 반대로 재검사 완료 시
              resetOnboarding()이 진행 중이던 실제 온보딩 답변까지 지워버릴 수 있다.
              로그인만 허용(RequireAuth)하되 게스트도 통과는 되므로 각 화면 안에서 isGuest면
              GuestNotice로 막는다. BottomNav 없는 전체화면 톤이라 MainLayout 밖에 둔다. */}
          <Route
            element={
              <RequireAuth>
                <OnboardingProvider storageNamespace="myEdit">
                  <Outlet />
                </OnboardingProvider>
              </RequireAuth>
            }
          >
            <Route path="/my/edit/region" element={<Region mode="edit" />} />
            <Route path="/my/edit/wbti/:step" element={<EditWbtiStep />} />
            <Route path="/my/edit/wbti/result" element={<EditWbtiResult />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

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
import Favorites from './pages/my/Favorites'

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

          {/* 상세 페이지는 하단 액션바(예약하기/길찾기)가 고정으로 깔려서 MainLayout의
              BottomNav와 겹친다 — /chatbot과 같은 이유로 MainLayout 밖에 둔다. */}
          <Route
            path="/map/:id"
            element={
              <RequireAuth>
                <MapDetail />
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

            <Route path="/history" element={<HistoryMain />} />
            <Route path="/history/calendar" element={<Calendar />} />
            <Route path="/history/visits" element={<Visits />} />

            <Route path="/my" element={<MyMain />} />
            <Route path="/my/edit" element={<EditProfile />} />
            <Route path="/my/favorites" element={<Favorites />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

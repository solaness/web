import { BrowserRouter, Routes, Route } from 'react-router-dom'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />

        <Route path="/onboarding/intro" element={<Intro />} />
        <Route path="/onboarding/login" element={<Login />} />
        <Route path="/onboarding/region" element={<Region />} />
        <Route path="/onboarding/test/1" element={<Test1 />} />
        <Route path="/onboarding/test/2" element={<Test2 />} />
        <Route path="/onboarding/test/3" element={<Test3 />} />
        <Route path="/onboarding/result" element={<Result />} />

        <Route path="/home" element={<Home />} />

        <Route path="/map" element={<MapSearch />} />
        <Route path="/map/:id" element={<MapDetail />} />

        <Route path="/chatbot" element={<Chatbot />} />

        <Route path="/history" element={<HistoryMain />} />
        <Route path="/history/calendar" element={<Calendar />} />
        <Route path="/history/visits" element={<Visits />} />

        <Route path="/my" element={<MyMain />} />
        <Route path="/my/edit" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

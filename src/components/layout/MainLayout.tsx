import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

function MainLayout() {
  return (
    <div className="pb-[100px]">
      <Outlet />
      <BottomNav />
    </div>
  )
}

export default MainLayout

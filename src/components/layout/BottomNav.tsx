import { Link, useLocation } from 'react-router-dom'
import type { FunctionComponent, SVGProps } from 'react'
import IconHome from '../../assets/icons/icon-home.svg?react'
import IconMap from '../../assets/icons/icon-map.svg?react'
import IconChatbot from '../../assets/icons/icon-chatbot.svg?react'
import IconHistory from '../../assets/icons/icon-history.svg?react'
import IconMy from '../../assets/icons/icon-my.svg?react'

interface NavItem {
  label: string
  path: string
  icon: FunctionComponent<SVGProps<SVGSVGElement>>
  iconMarginTop: number
}

const navItems: NavItem[] = [
  { label: '홈', path: '/home', icon: IconHome, iconMarginTop: 11 },
  { label: '지도', path: '/map', icon: IconMap, iconMarginTop: 11 },
  { label: '챗봇', path: '/chatbot', icon: IconChatbot, iconMarginTop: 2 },
  { label: '기록', path: '/history', icon: IconHistory, iconMarginTop: 12 },
  { label: '마이', path: '/my', icon: IconMy, iconMarginTop: 14 },
]

function BottomNav() {
  const location = useLocation()

  return (
    <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3">
      <nav className="flex h-[73px] w-full max-w-md items-stretch justify-between rounded-full border border-[#FFAC27] bg-white px-2 shadow-[4px_4px_3px_0px_#FAC77566]">
        {navItems.map(({ label, path, icon: Icon, iconMarginTop }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`)

          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center"
            >
              <Icon
                fill={isActive ? 'currentColor' : 'none'}
                className={isActive ? 'text-[#FAC775]' : 'text-[#D9D9D9]'}
                style={{ marginTop: iconMarginTop }}
              />
              <span
                className={`mt-auto pb-[5px] text-[14px] font-medium ${isActive ? 'text-[#FAC775]' : 'text-[#D9D9D9]'}`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default BottomNav

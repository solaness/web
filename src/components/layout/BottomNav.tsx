import { Link, useLocation } from 'react-router-dom'
import type { FunctionComponent, SVGProps } from 'react'
import IconHome from '../../assets/icons/icon-home.svg?react'
import IconHomeActive from '../../assets/icons/icon-home-active.svg?react'
import IconMap from '../../assets/icons/icon-map.svg?react'
import IconMapActive from '../../assets/icons/icon-map-active.svg?react'
import IconChatbot from '../../assets/icons/icon-chatbot.svg?react'
import IconHistory from '../../assets/icons/icon-history.svg?react'
import IconMy from '../../assets/icons/icon-my.svg?react'
import IconMyActive from '../../assets/icons/icon-my-active.svg?react'

interface NavItem {
  label: string
  path: string
  icon: FunctionComponent<SVGProps<SVGSVGElement>>
  activeIcon?: FunctionComponent<SVGProps<SVGSVGElement>>
  iconMarginTop: number
}

const navItems: NavItem[] = [
  { label: '홈', path: '/home', icon: IconHome, activeIcon: IconHomeActive, iconMarginTop: 11 },
  { label: '지도', path: '/map', icon: IconMap, activeIcon: IconMapActive, iconMarginTop: 11 },
  { label: '챗봇', path: '/chatbot', icon: IconChatbot, iconMarginTop: 2 },
  { label: '기록', path: '/history', icon: IconHistory, iconMarginTop: 12 },
  { label: '마이', path: '/my', icon: IconMy, activeIcon: IconMyActive, iconMarginTop: 12 },
]

function BottomNav() {
  const location = useLocation()

  return (
    <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3">
      <nav className="flex h-[76px] w-full max-w-md items-stretch justify-between rounded-full border border-[#FFAC27] bg-white px-2 shadow-[0px_0px_8px_0px_#FAC775]">
        {navItems.map(({ label, path, icon: Icon, activeIcon: ActiveIcon, iconMarginTop }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`)

          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center"
            >
              {isActive && ActiveIcon ? (
                <ActiveIcon className="shrink-0" style={{ marginTop: iconMarginTop }} />
              ) : (
                <Icon
                  fill={isActive ? 'currentColor' : 'none'}
                  className={`shrink-0 ${isActive ? 'text-[#FAC775]' : 'text-[#D9D9D9]'}`}
                  style={{ marginTop: iconMarginTop }}
                />
              )}
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

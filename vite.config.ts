import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    proxy: {
      // 관광공사 TourAPI는 브라우저 직접 호출 시 CORS로 막힐 가능성이 높아
      // 로컬 개발 중에는 Vite 프록시로 우회한다 (배포용 프록시는 다음 이슈).
      "/api/tour": {
        target: "https://apis.data.go.kr/B551011/KorService2",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tour/, ""),
      },
    },
  },
})
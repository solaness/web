import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    proxy: {
      // 관광공사 TourAPI는 브라우저 직접 호출 시 CORS로 막힐 가능성이 높고, serviceKey를
      // 클라이언트에 노출하지 않기 위해 로컬에서도 배포와 동일하게 Cloud Functions 프록시
      // (functions/src/index.ts의 tourApiProxy)를 거친다. `firebase emulators:start --only functions`로
      // 로컬 에뮬레이터를 띄운 뒤 `npm run dev`를 실행해야 한다 (firebase.json의 emulators.functions.port 참고).
      // 배포 환경에서는 firebase.json의 hosting.rewrites가 같은 경로를 실제 tourApiProxy 함수로 보낸다.
      "/api/tour": {
        target: "http://127.0.0.1:5001/sollanis/asia-northeast3/tourApiProxy",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tour/, ""),
      },
    },
  },
})
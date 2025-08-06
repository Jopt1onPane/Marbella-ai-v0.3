import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 强制标识：现代化UI版本 8.2.0 - PostCSS配置修复版
console.log('🎨 Modern UI System v8.2.0 - PostCSS Config Fixed Loading...')
console.log('🔧 UI Mode:', __UI_MODE__)
console.log('⏰ Build Time:', __BUILD_TIME__)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

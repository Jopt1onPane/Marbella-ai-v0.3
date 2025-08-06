import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 强制标识：现代化UI版本 7.0.0
console.log('🎨 Modern UI System v7.0.0 Loading...')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

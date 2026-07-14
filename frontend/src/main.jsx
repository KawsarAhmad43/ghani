import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import API_URL from './utils/api'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

// Global interceptor to route all requests dynamically based on VITE_API_URL
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', API_URL);
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)


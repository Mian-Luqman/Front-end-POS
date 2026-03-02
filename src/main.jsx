// src/main.jsx  (ya src/index.jsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '15px',
          padding: '12px 20px',
        },
        success: {
          style: { background: '#28a745' },
        },
        error: {
          style: { background: '#dc3545' },
        },
      }}
    />
  </React.StrictMode>
)
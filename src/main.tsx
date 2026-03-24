import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeDB } from './db/indexedDB'
import { initializePlayerDB } from './player/storage/playerDB'

// Initialize both IndexedDB databases
Promise.all([initializeDB(), initializePlayerDB()]).catch((err) => {
  console.error('Failed to initialize databases:', err)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

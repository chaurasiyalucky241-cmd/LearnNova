import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './login.jsx'
import MainPage from './mainpage.jsx'

const THEME_STORAGE_KEY = "studentsuccess-theme"

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) || "midnight"
    } catch {
      return "midnight"
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  return isLoggedIn ? (
    <MainPage theme={theme} setTheme={setTheme} user={user} onLogout={() => setIsLoggedIn(false)} />
  ) : (
    <Login
      theme={theme}
      setTheme={setTheme}
      onLogin={(nextUser) => {
        setUser(nextUser)
        setIsLoggedIn(true)
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
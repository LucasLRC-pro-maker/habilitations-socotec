import { createContext, useContext, useState } from 'react'
import { ADMIN_PASSWORD } from '../lib/habilitations'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('hab_admin') === '1')

  function login(password) {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('hab_admin', '1')
      setIsAdmin(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('hab_admin')
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

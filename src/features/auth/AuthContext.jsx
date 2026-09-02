import { createContext, useState } from 'react'
import { login as loginApi } from './api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [pending, setPending] = useState(false)

  async function login(name) {
    setPending(true)
    try {
      setUser(await loginApi(name))
    } finally {
      setPending(false)
    }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, pending, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

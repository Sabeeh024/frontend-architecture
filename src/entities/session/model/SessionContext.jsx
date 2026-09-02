import { createContext, useState } from 'react'
import { login as loginRequest } from '../api/login'

export const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [pending, setPending] = useState(false)

  async function login(name) {
    setPending(true)
    try {
      setUser(await loginRequest(name))
    } finally {
      setPending(false)
    }
  }

  const logout = () => setUser(null)

  return (
    <SessionContext.Provider value={{ user, pending, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

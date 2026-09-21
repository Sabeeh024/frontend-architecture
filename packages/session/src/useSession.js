import { useSyncExternalStore } from 'react'
import { getUser, subscribe } from './store'

export function useSession() {
  return useSyncExternalStore(subscribe, getUser)
}

import {createContext, useContext, useState, useRef, useEffect} from 'react'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children}) => {
  const [token, setToken] = useState(null)

  return (
    <AuthContext.Provider value={{token, setToken}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useInterval(callback, delay, stopFlag) {
  const savedCallback = useRef()
  //Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    let id
    function tick() {
      savedCallback.current()
      if (stopFlag) {
        clearInterval(id)
      }
    }
    if (delay !== null && !stopFlag) {
      id = setInterval(tick, delay)
      return () => {
        clearInterval(id)
      }
    }
  })
}

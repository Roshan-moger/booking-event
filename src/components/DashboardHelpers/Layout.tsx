"use client"
import type React from "react"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import type { InitialReduxStateProps } from "../../redux/redux.props"
import { update_auth_data } from "../../redux/action"
import { jwtDecode } from "jwt-decode"
import { store } from "../../redux/store"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Redux state
  const token = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.accessToken
  )
  const tokenExpiry = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.expiryTime
  )

  // Load token from localStorage OR redirect if missing
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken")

    if (!storedToken) {
      // ❌ No token -> redirect to "/"
      navigate("/")
      return
    }

    // Ensure "Bearer " prefix
    const finalToken = storedToken.startsWith("Bearer")
      ? storedToken
      : `Bearer ${storedToken}`

    try {
      const decodedUser: any = jwtDecode(finalToken.replace("Bearer ", ""))

      const payload = {
        token: finalToken,
        roles: decodedUser.roles || [],
        email: decodedUser.sub,
        expiryTime: decodedUser.exp
          ? new Date(decodedUser.exp * 1000).toISOString()
          : "",
      }
      store.dispatch(update_auth_data(payload))
    } catch (err) {
      console.error("Failed to decode token:", err)
      // Bad token -> redirect to "/"
      localStorage.removeItem("accessToken")
      navigate("/")
    }
  }, [dispatch, navigate])

  // Check token expiry continuously
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token && tokenExpiry) {
        const currentTime = Date.now()
        const expiryTime = new Date(tokenExpiry).getTime()
        const isExpired = currentTime > expiryTime

        if (isExpired) {
          dispatch({ type: "CLEAR_AUTH" })
          localStorage.removeItem("accessToken")
          localStorage.removeItem("expiryTime")
          navigate("/")
        }
      }
    }

    checkTokenExpiration() // run immediately
    const interval = setInterval(checkTokenExpiration, 60000)
    return () => clearInterval(interval)
  }, [token, tokenExpiry, dispatch, navigate])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout

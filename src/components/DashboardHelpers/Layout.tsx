"use client"
import type React from "react"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import type { InitialReduxStateProps } from "../../redux/redux.props"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Get token and expiry from Redux state
  const token = useSelector((state: InitialReduxStateProps) => state.tokenInfo.accessToken)
  const tokenExpiry = useSelector((state: InitialReduxStateProps) => state.tokenInfo.expiryTime)

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token && tokenExpiry) {
        const currentTime = Date.now()

        // Convert ISO date string to ms timestamp
        const expiryTime = new Date(tokenExpiry).getTime()

        const isExpired = currentTime > expiryTime

        if (isExpired) {
          // Clear token from state and redirect to session expired page
          dispatch({ type: "CLEAR_AUTH" }) // Adjust action type according to your Redux setup
          navigate("/common")
        }
      } else if (!token) {
        // If no token, redirect to session expired
        navigate("/common")
      }
    }

    // Check immediately
    checkTokenExpiration()
    
    // Set up interval to check every minute
    const interval = setInterval(checkTokenExpiration, 60000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [token, tokenExpiry, dispatch, navigate])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - hidden on mobile, fixed on desktop */}
      <Sidebar />
      
      {/* Main content wrapper (Header + Content + Footer) */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Header at top */}
        <Header />
        
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        
        {/* Footer fixed at bottom */}
        {/* <Footer /> */}
      </div>
    </div>
  )
}

export default Layout

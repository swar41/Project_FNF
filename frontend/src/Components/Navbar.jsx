import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout, getAuth, isAuthenticated } from '../utils/auth'

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = getAuth()
  const authenticated = isAuthenticated()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to={authenticated ? "/feed" : "/"} className="logo">
            FNF Knowledge Hub
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-buttons">
            {authenticated ? (
              <>
                <Link to="/feed" className="btn btn-outline">Feed</Link>
                <Link to="/new" className="btn">New Post</Link>
                <Link to="/profile" className="btn btn-secondary">Profile</Link>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/signup" className="btn">Sign Up</Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button 
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="mobile-sidebar open">
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>

            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Menu</h3>
              
              {authenticated ? (
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/feed" 
                    className="btn"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Feed
                  </Link>
                  <Link 
                    to="/new" 
                    className="btn"
                    onClick={() => setSidebarOpen(false)}
                  >
                    New Post
                  </Link>
                  <Link 
                    to="/profile" 
                    className="btn btn-secondary"
                    onClick={() => setSidebarOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/commits" 
                    className="btn btn-secondary"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Commits
                  </Link>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/login" 
                    className="btn btn-outline"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="btn"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import { saveAuth } from '../utils/auth'
import Navbar from '../Components/Navbar'
import '../styles/global.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(false) // ✅ added
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/feed'

  useEffect(() => {
    setEmail('')
    setPassword('')
    sessionStorage.removeItem('login_email')
    sessionStorage.removeItem('login_password')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      })

      // ✅ save with remember flag
      saveAuth(response.data, remember)

      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)

      if (error.response?.status === 401) {
        setError('Invalid email or password')
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />

      <main className="container" style={{ marginTop: '4rem' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1>Welcome</h1>
              <p style={{ color: '#6c757d' }}>Sign in to your account</p>
            </div>

            {error && (
              <div
                style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  border: '1px solid #f5c6cb',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* ✅ Added Remember Me */}
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <label htmlFor="remember" style={{ marginLeft: '0.5rem' }}>
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="btn"
                style={{ width: '100%', marginBottom: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6c757d' }}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ fontWeight: 'bold' }}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
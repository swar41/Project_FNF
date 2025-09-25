import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { saveAuth } from '../utils/auth'
import Navbar from '../Components/Navbar'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    checkPasswordStrength(password)
  }, [password])

  async function fetchDepartments() {
    try {
      const response = await api.get('/departments')
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  function checkPasswordStrength(pwd) {
    if (!pwd) {
      setPasswordStrength('')
      return
    }

    if (pwd.length < 6) {
      setPasswordStrength('weak')
    } else if (pwd.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('strong')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('FullName', fullName.trim())
      formData.append('Email', email.trim())
      formData.append('Password', password)
      if (departmentId) formData.append('DepartmentId', departmentId)

      const response = await api.post('/auth/register', formData)
      
      saveAuth(response.data)
      navigate('/feed')
    } catch (error) {
      console.error('Signup failed:', error)
      if (error.response?.status === 400) {
        setError(error.response.data?.message || 'Invalid registration data')
      } else if (error.response?.status === 409) {
        setError('An account with this email already exists')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'strong': return '#28a745'
      default: return '#6c757d'
    }
  }

  return (
    <div>
      <Navbar />
      
      <main className="container" style={{ marginTop: '4rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1>Join FNF Knowledge Hub</h1>
              <p style={{ color: '#6c757d' }}>Create your account to get started</p>
            </div>

            {error && (
              <div style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                marginBottom: '1rem',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={e => setDepartmentId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select your department (optional)</option>
                  {departments.map(dept => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                />
                {password && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    marginTop: '0.25rem',
                    color: getPasswordStrengthColor()
                  }}>
                    Password strength: <strong>{passwordStrength || 'weak'}</strong>
                    {passwordStrength === 'weak' && ' (too short)'}
                    {passwordStrength === 'medium' && ' (add uppercase, numbers)'}
                    {passwordStrength === 'strong' && ' ✓'}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                {confirmPassword && password !== confirmPassword && (
                  <div style={{ fontSize: '0.8rem', color: '#dc3545', marginTop: '0.25rem' }}>
                    Passwords do not match
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <span style={{ fontSize: '0.9rem' }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{ fontWeight: 'bold' }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" style={{ fontWeight: 'bold' }}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn" 
                style={{ width: '100%', marginBottom: '1rem' }}
                disabled={loading || password !== confirmPassword}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6c757d' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 'bold' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="card" style={{ marginTop: '2rem', background: '#f8f9fa' }}>
            <h4 style={{ marginBottom: '1rem' }}>Why Join FNF Knowledge Hub?</h4>
            <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>Access unlimited knowledge posts</li>
              <li style={{ marginBottom: '0.5rem' }}>Share your expertise with colleagues</li>
              <li style={{ marginBottom: '0.5rem' }}>Get help from your team instantly</li>
              <li style={{ marginBottom: '0.5rem' }}>Track your contributions and commits</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}


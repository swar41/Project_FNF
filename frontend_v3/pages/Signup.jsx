import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../Components/Navbar'
import { saveAuth } from '../utils/auth'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [profileFile, setProfileFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (!profileFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(profileFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [profileFile])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('FullName', fullName.trim())
      formData.append('Email', email.trim())
      formData.append('Password', password)
      if (departmentId) formData.append('DepartmentId', departmentId)
      if (profileFile) formData.append('ProfilePicture', profileFile)

      const res = await api.post('/auth/register', formData)
      saveAuth(res.data)
      navigate('/feed')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '4rem' }}>
        <form
          className="card"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <h2 className="mb-3">Create Account</h2>

          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <label>Department </label>
          <input
            type="number"
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
          />

          <label>Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setProfileFile(e.target.files?.[0] ?? null)}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                marginTop: 8,
              }}
            />
          )}

          <button className="btn mt-3" type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
      </main>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import api from '../utils/api'

export default function ProfileEdit() {
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [newFile, setNewFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!newFile) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(newFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [newFile])

  async function fetchProfile() {
    try {
      const res = await api.get('/users/me')
      setProfile(res.data)
      setFullName(res.data.fullName || '')
      setEmail(res.data.email || '')
      setDepartmentId(res.data.departmentId || '')
    } catch (err) {
      console.error(err)
      alert('Unable to load profile')
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      if (fullName) fd.append('FullName', fullName)
      if (email) fd.append('Email', email)
      if (password) fd.append('Password', password)
      if (departmentId) fd.append('DepartmentId', departmentId)
      if (newFile) fd.append('ProfilePicture', newFile)

      const res = await api.put('/users/update-profile', fd)
      alert('Profile updated')
      navigate('/profile')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <form className="card" onSubmit={handleSave} encType="multipart/form-data">
          <h2 className="mb-3">Edit Profile</h2>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: profile?.profilePicture ? 'transparent' : '#007bff',
                backgroundImage: profile?.profilePicture
                  ? `url("http://localhost:5157/${profile.profilePicture}")`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewFile(e.target.files?.[0] ?? null)}
              />
              {preview && (
                <img
                  src={preview}
                  alt="new"
                  style={{ width: 48, height: 48, borderRadius: 24, marginTop: 8 }}
                />
              )}
            </div>
          </div>

          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label>New Password (leave blank to keep)</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <label>Department</label>
          <input
            type="number"
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
          />

          <button className="btn mt-3" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </main>
    </div>
  )
}
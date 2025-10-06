
import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import dayjs from 'dayjs'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const res = await api.get('/commits/my-notifications')
          console.log("✅ Notifications data:", res.data) // 👈 ADD THIS

      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <h1>Manager Actions on Your Posts</h1>
        {notifications.length === 0 ? (
          <p>No manager actions yet.</p>
        ) : (
          <ul className="card" style={{ padding: '1rem' }}>
            {notifications.map((n, i) => (
              <li key={i} style={{ marginBottom: '1rem' }}>
                <strong>{n.managerName}</strong> — {n.message}<br />
                <span style={{ color: '#6c757d' }}>
                  on post <em>“{n.postTitle}”</em> • {dayjs(n.createdAt).format('DD MMM YYYY, hh:mm A')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
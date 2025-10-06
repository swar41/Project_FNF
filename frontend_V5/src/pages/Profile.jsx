
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import PostCard from '../Components/PostCard'
import { getAuth } from '../utils/auth'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [userReposts, setUserReposts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    fetchProfile()
    fetchUserPosts()
    fetchStats()
  }, [])

  async function fetchProfile() {
    try {
      const response = await api.get('/users/me')
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  async function fetchUserPosts() {
    try {
      const response = await api.get('/posts/mine')
      setUserPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch user posts:', error)
      setUserPosts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserReposts() {
    try {
      const response = await api.get('/posts/my-reposts')
      setUserReposts(response.data)
    } catch (error) {
      console.error('Failed to fetch user reposts:', error)
      setUserReposts([])
    }
  }

  async function fetchStats() {
    try {
      const response = await api.get('/users/me/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // fallback
      setStats({
        totalPosts: userPosts.length,
        totalUpvotes: userPosts.reduce((sum, post) => sum + (post.upvoteCount || 0), 0),
        totalDownvotes: userPosts.reduce((sum, post) => sum + (post.downvoteCount || 0), 0),
        totalCommentsReceived: userPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
        totalCommitsMade: 0
      })
    }
  }

  useEffect(() => {
    if (activeTab === 'reposts') {
      fetchUserReposts()
    }
  }, [activeTab])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container loading">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        {/* Profile Header */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {!profile?.profilePicture && (profile?.fullName?.[0] || auth.fullName?.[0] || '?')}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ marginBottom: '0.25rem' }}>
                {profile?.fullName || auth.fullName || 'Unknown User'}
              </h1>
              <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                {profile?.email || 'No email provided'}
              </p>
              {profile?.department && (
                <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  {profile.department} Department
                </p>
              )}
            </div>

            <button className="btn btn-outline" onClick={() => navigate('/profile/edit')}>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex gap-4" style={{ borderBottom: '1px solid #e9ecef', marginBottom: '1.5rem' }}>
            <button
              className={`btn ${activeTab === 'posts' ? '' : 'btn-outline'}`}
              style={{ borderRadius: '0', borderBottom: activeTab === 'posts' ? '2px solid #007bff' : 'none' }}
              onClick={() => setActiveTab('posts')}
            >
              My Posts 
            </button>

            <button
              className={`btn ${activeTab === 'reposts' ? '' : 'btn-outline'}`}
              style={{ borderRadius: '0', borderBottom: activeTab === 'reposts' ? '2px solid #007bff' : 'none' }}
              onClick={() => setActiveTab('reposts')}
            >
              My Reposts 
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div>
              {userPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <h3>No posts yet</h3>
                  <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                    You haven't created any posts. Share your knowledge with the team!
                  </p>
                  <button className="btn" onClick={() => navigate('/new')}>
                    Create Your First Post
                  </button>
                </div>
              ) : (
                <div>
                  {userPosts.map(post => (
                    <PostCard key={post.postId} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reposts' && (
            <div>
              {userReposts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <h3>No reposts yet</h3>
                  <p style={{ color: '#6c757d' }}>You haven't reposted anything yet.</p>
                </div>
              ) : (
                <div>
                  {userReposts.map(post => (
                    <PostCard key={post.postId} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

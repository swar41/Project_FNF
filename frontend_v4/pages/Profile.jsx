
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import PostCard from '../Components/PostCard'
import { getAuth } from '../utils/auth'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
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
    }
  }

  async function fetchStats() {
  try {
    const response = await api.get('/users/me/stats')
    setStats(response.data)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // Fallback to calculating from posts if API fails
    setStats({
      totalPosts: userPosts.length,
      totalUpvotes: userPosts.reduce((sum, post) => sum + (post.upvoteCount || 0), 0),
      totalDownvotes: userPosts.reduce((sum, post) => sum + (post.downvoteCount || 0), 0),
      totalCommentsReceived: userPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
      totalCommitsMade: 0
    })
  } finally {
    setLoading(false)
  }
}

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
        <div className="card">
          <div className="flex gap-4 items-center">
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: profile?.profilePicture ? `url("http://localhost:5157/${profile.profilePicture}")` : '#007bff',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflow: 'hidden',
              display: 'flex',
              // alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
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

            <button 
              className="btn btn-outline"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', fontSize: '2rem', marginBottom: '0.5rem' }}>
            {stats?.totalPosts || 0}
          </h3>
          <p style={{ color: '#6c757d' }}>Posts Created</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
            {stats?.totalUpvotes || 0}
          </h3>
          <p style={{ color: '#6c757d' }}>Total Upvotes</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#ffc107', fontSize: '2rem', marginBottom: '0.5rem' }}>
            {stats?.totalCommentsReceived || 0}
          </h3>
          <p style={{ color: '#6c757d' }}>Comments Received</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6f42c1', fontSize: '2rem', marginBottom: '0.5rem' }}>
            {stats?.totalCommitsMade || 0}
          </h3>
          <p style={{ color: '#6c757d' }}>Commits Made</p>
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
              My Posts ({userPosts.length})
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

          
        </div>
      </main>
    </div>
  )
}
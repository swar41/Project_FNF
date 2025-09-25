import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import Navbar from '../Components/Navbar'
import PostCard from '../Components/PostCard'

// Mock data for guest users
const samplePosts = [
  {
    id: '1',
    title: 'How to connect to company VPN',
    content: 'Step-by-step: open VPN client, add server address, use corporate credentials. If MFA enabled, approve on your device. Troubleshoot: check firewall, DNS, and certificates.',
    tags: ['VPN', 'IT', 'Security'],
    dept: 'IT Department',
    authorName: 'John Smith',
    updates: 12,
    downvotes: 0,
    comments: 3,
    createdAt: '2025-09-19T22:51:21Z'
  },
  {
    id: '2',
    title: 'How to raise leave request',
    content: 'Open HR portal → My Requests → New Leave. Select dates, reason and approver. Attach docs if needed. Manager gets a notification.',
    tags: ['HR', 'Leave', 'Process'],
    dept: 'HR Department',
    authorName: 'Sarah Johnson',
    updates: 8,
    downvotes: 0,
    comments: 5,
    createdAt: '2025-09-19T22:57:11Z'
  },
  {
    id: '3',
    title: 'Setup local SQL Server',
    content: 'Install SQL Server Express, enable TCP/IP, create SQL auth user and update connection string in appsettings.json. Remember to configure firewall rules.',
    tags: ['SQL', 'Server', 'Development'],
    dept: 'Development',
    authorName: 'Mike Chen',
    updates: 10,
    downvotes: 1,
    comments: 7,
    createdAt: '2025-09-19T23:11:43Z'
  },
  {
    id: '4',
    title: 'Best practices for code reviews',
    content: 'Always review for functionality, security, and maintainability. Use automated tools, focus on logic and potential bugs, provide constructive feedback.',
    tags: ['Code Review', 'Best Practices', 'Development'],
    dept: 'Development',
    authorName: 'Emily Davis',
    updates: 15,
    downvotes: 0,
    comments: 12,
    createdAt: '2025-09-20T09:30:00Z'
  }
]

export default function Home() {
  const navigate = useNavigate()
  const [viewedCount, setViewedCount] = useState(0)
  const maxViewsForGuest = 3

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/feed', { replace: true })
    }
  }, [navigate])

  const handlePostClick = (postId) => {
    if (viewedCount >= maxViewsForGuest) {
      navigate('/login')
      return
    }
    setViewedCount(prev => prev + 1)
    navigate(`/post/${postId}`)
  }

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="guest-hero">
        <div className="container">
          <h1>Welcome to FNF Knowledge Hub</h1>
          <p>Discover solutions, share knowledge, and collaborate with your team</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h2>Recent Knowledge Posts</h2>
          {viewedCount < maxViewsForGuest ? (
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              You can view {maxViewsForGuest - viewedCount} more post{maxViewsForGuest - viewedCount !== 1 ? 's' : ''} as a guest. 
              <a href="/signup" style={{ marginLeft: '0.5rem' }}>Sign up</a> for unlimited access.
            </p>
          ) : (
            <div className="card" style={{ textAlign: 'center', background: '#f8f9fa' }}>
              <h3>Guest View Limit Reached</h3>
              <p>You've reached the maximum number of posts you can view as a guest.</p>
              <div className="flex gap-2" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn" onClick={() => navigate('/signup')}>
                  Sign Up for Free
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/login')}>
                  Login
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          {samplePosts.map(post => (
            <div key={post.id} onClick={() => handlePostClick(post.id)} style={{ cursor: 'pointer' }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="card" style={{ textAlign: 'center', marginTop: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Join FNF Knowledge Hub Today</h3>
          <p>Access unlimited posts, create your own content, and collaborate with your team.</p>
          <div className="flex gap-2" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <button className="btn" style={{ background: 'white', color: '#333' }} onClick={() => navigate('/signup')}>
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// src/pages/Commits.jsx

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function Commits() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, approved, pending, rejected

  useEffect(() => {
    fetchCommits()
  }, [])

  async function fetchCommits() {
    try {
      setLoading(true)
      const response = await api.get('/commits/mine')
      setCommits(response.data)
    } catch (error) {
      console.error('Failed to fetch commits:', error)
      setCommits([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#28a745'
      case 'rejected': return '#dc3545'
      case 'pending': return '#ffc107'
      default: return '#6c757d'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '✅'
      case 'rejected': return '❌'
      case 'pending': return '⏳'
      default: return '📝'
    }
  }

  const filteredCommits = commits.filter(commit => {
    if (filter === 'all') return true
    return commit.status?.toLowerCase() === filter
  })

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container loading">
          <p>Loading commits...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h1>Your Commits</h1>
            <p style={{ color: '#6c757d' }}>
              Track your contributions and knowledge updates
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#007bff', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {commits.length}
            </h3>
            <p style={{ color: '#6c757d' }}>Total Commits</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {commits.filter(c => c.status?.toLowerCase() === 'approved').length}
            </h3>
            <p style={{ color: '#6c757d' }}>Approved</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#ffc107', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {commits.filter(c => c.status?.toLowerCase() === 'pending').length}
            </h3>
            <p style={{ color: '#6c757d' }}>Pending Review</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc3545', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {commits.filter(c => c.status?.toLowerCase() === 'rejected').length}
            </h3>
            <p style={{ color: '#6c757d' }}>Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
            <button 
              className={`btn ${filter === 'approved' ? '' : 'btn-outline'}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({commits.filter(c => c.status?.toLowerCase() === 'approved').length})
            </button>
            <button 
              className={`btn ${filter === 'pending' ? '' : 'btn-outline'}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({commits.filter(c => c.status?.toLowerCase() === 'pending').length})
            </button>
            <button 
              className={`btn ${filter === 'rejected' ? '' : 'btn-outline'}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({commits.filter(c => c.status?.toLowerCase() === 'rejected').length})
            </button>
            <button
              className={`btn ${filter === 'all' ? '' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All ({commits.length})
            </button>
          </div>

          {/* Commits List */}
          {filteredCommits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No commits found</h3>
              <p style={{ color: '#6c757d' }}>
                {filter === 'all' 
                  ? "You haven't made any commits yet. Start contributing to knowledge posts!"
                  : `No ${filter} commits found.`
                }
              </p>
            </div>
          ) : (
            <div>
              {filteredCommits.map(commit => (
                <div key={commit.commitId} className="card" style={{ marginBottom: '1rem' }}>
                  <div className="flex justify-between items-start">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {getStatusIcon(commit.status)}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '0.85rem',
                            color: getStatusColor(commit.status),
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}
                        >
                          {/* {commit.status || 'Draft'} */}
                        </span>
                      </div>
                      
                      {/* <h4 style={{ marginBottom: '0.5rem' }}>
                        <Link to={`/post/${commit.postId}`} style={{ color: '#333' }}>
                          {commit.postTitle || `Post #${commit.postId}`}
                        </Link>
                      </h4> */}
                      
                      <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                        {commit.message || 'No commit message provided'}
                      </p>
                      
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        <div>
                          Commited by: <strong>{commit.manager?.user?.fullName || commit.managerName || 'You'}</strong>
                        </div>
                        <div>
                          {dayjs(commit.createdAt).format('MMMM D, YYYY at h:mm A')} 
                          <span style={{ marginLeft: '0.5rem' }}>
                            ({dayjs(commit.createdAt).fromNow()})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    
                  </div>
                  
                  {/* Feedback */}
                  {commit.feedback && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.75rem', 
                      background: '#f8f9fa', 
                      borderRadius: '4px',
                      borderLeft: `4px solid ${getStatusColor(commit.status)}`
                    }}>
                      <strong style={{ fontSize: '0.85rem' }}>Manager Feedback:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                        {commit.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
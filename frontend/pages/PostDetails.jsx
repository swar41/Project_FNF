import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../Components/Navbar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { isAuthenticated, getAuth } from '../utils/auth'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Comments from '../Components/Comments'
dayjs.extend(relativeTime)

export default function PostDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [editingPost, setEditingPost] = useState(false)
  const [postForm, setPostForm] = useState({ title: '', body: '' })
  const auth = getAuth()

  useEffect(() => { fetchPost() }, [id])

  async function fetchPost() {
    try {
      setLoading(true)
      const res = await api.get(`/posts/${id}`)
      setPost(res.data)
      setPostForm({ title: res.data.title, body: res.data.body })
    } catch (e) {
      if (e.response?.status === 404) navigate('/feed')
    } finally { setLoading(false) }
  }

  async function handleVote(type) {
    if (!isAuthenticated()) return navigate('/login')
    try {
      setVoting(true)
      await api.post(`/votes`, { postId: parseInt(id, 10), commentId: null, voteType: type })
      await fetchPost()
    } finally { setVoting(false) }
  }

  async function handleRepost() {
    if (!isAuthenticated()) return navigate('/login')
    try {
      await api.post(`/posts/${id}/repost`)
      alert('Post reposted!')
    } catch { alert('Repost failed') }
  }

  async function handleDeletePost() {
    const msg = auth?.role === 'Manager'
      ? prompt('Enter commit message:')
      : 'User deleted own post'
    if (!msg) return
    await api.delete(`/posts/${id}?commitMessage=${encodeURIComponent(msg)}`)
    navigate('/feed')
  }

  async function handleUpdatePost() {
    const msg = auth?.role === 'Manager' ? prompt('Enter commit message:') : null
    if (auth?.role === 'Manager' && !msg) return
    await api.put(
      `/posts/${id}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`,
      { title: postForm.title, body: postForm.body }
    )
    setEditingPost(false)
    fetchPost()
  }

  function renderBlocks(bodyJson) {
    if (!bodyJson) return <p>No content available</p>
    try {
      const blocks = typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson
      if (!Array.isArray(blocks)) return <p>{bodyJson}</p>
      return blocks.map((b, i) =>
        b.type === 'code' ? (
          <div key={i} style={{ position: 'relative', marginBottom: '1rem' }}>
            <button className="btn btn-outline"
              style={{ position: 'absolute', right: '10px', top: '10px' }}
              onClick={() => navigator.clipboard.writeText(b.content)}>Copy Code</button>
            <SyntaxHighlighter language="python" showLineNumbers>{b.content}</SyntaxHighlighter>
          </div>
        ) : <p key={i} style={{ marginBottom: '1rem' }}>{b.content || ''}</p>
      )
    } catch { return <div className="markdown-content">{bodyJson}</div> }
  }

  if (loading) return <><Navbar /><div className="container loading"><p>Loading post...</p></div></>
  if (!post) return <><Navbar /><div className="container"><div className="card" style={{ textAlign: 'center' }}>
    <h2>Post not found</h2><button className="btn" onClick={() => navigate('/feed')}>Back to Feed</button>
  </div></div></>

  const isManager = auth?.role === 'Manager'
  const isOwner = String(post.userId) === String(auth?.userId)
  const canManagePost = isManager && String(auth?.departmentId) === String(post.deptId)

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
        <article className="card">
          {editingPost ? (
            <div>
              <input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                style={{ width: '100%', marginBottom: '1rem' }} />
              <textarea value={postForm.body} onChange={e => setPostForm({ ...postForm, body: e.target.value })}
                rows={6} style={{ width: '100%' }} />
              <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                <button className="btn" onClick={handleUpdatePost}>Save</button>
                <button className="btn btn-outline" onClick={() => setEditingPost(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
                <h1>{post.title}</h1>
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{post.authorName}</strong>{post.department && <span> • {post.department}</span>}
                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {dayjs(post.createdAt).format('MMMM D, YYYY h:mm A')} ({dayjs(post.createdAt).fromNow()})
                    </div>
                  </div>
                  {isAuthenticated() &&
                    <div className="flex gap-2">
                      <button className="btn btn-outline" onClick={handleRepost}>🔄 Repost</button>
                      {(canManagePost || isOwner) &&
                        <>
                          <button className="btn btn-outline" onClick={() => setEditingPost(true)}>✏️ Edit</button>
                          <button className="btn btn-outline" onClick={handleDeletePost}>🗑 Delete</button>
                        </>}
                    </div>}
                </div>
                {post.tags?.length > 0 &&
                  <div style={{ marginTop: '1rem' }}>{post.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>}
              </header>
              <div className="markdown-content">{renderBlocks(post.bodyPreview || post.body)}</div>
            </>
          )}

          {post.attachments?.length > 0 &&
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <h3>Attachments</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {post.attachments.map(f => {
                  const url = `http://localhost:5157/${f.filePath}`
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
                  return <li key={f.attachmentId} style={{ marginBottom: '1rem' }}>
                    {isImg
                      ? <img src={url} alt={f.fileName} style={{ maxWidth: '100%', borderRadius: '6px' }} />
                      : <a href={url} target="_blank" rel="noreferrer">📎 {f.fileName}</a>}
                  </li>
                })}
              </ul>
            </div>}
          <footer style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button className="btn btn-outline" onClick={() => handleVote('Upvote')}
                  disabled={voting || !isAuthenticated()}>▲ {post.upvoteCount || 0}</button>
                <button className="btn btn-outline" onClick={() => handleVote('Downvote')}
                  disabled={voting || !isAuthenticated()}>▼ {post.downvoteCount || 0}</button>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>💬 {post.commentsCount || 0} comments</div>
            </div>
          </footer>
        </article>
        <Comments postId={post.postId} canManagePost={canManagePost} auth={auth} />
      </main>
    </div>
  )
}
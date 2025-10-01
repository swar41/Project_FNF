
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import dayjs from 'dayjs'
import { isAuthenticated } from '../utils/auth'

export default function Comments({ postId, canManagePost, auth }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchComments() }, [postId])

  async function fetchComments() {
    try {
      setLoading(true)
      const res = await api.get(`/comments/post/${postId}?hierarchical=true`)
      setComments(res.data)
    } catch { setComments([]) }
    finally { setLoading(false) }
  }

  async function submitComment() {
    if (!isAuthenticated()) return navigate('/login')
    if (!newComment.trim()) return
    try {
      setSubmitting(true)
      await api.post('/comments', { postId, commentText: newComment.trim() })
      setNewComment('')
      fetchComments()
    } finally { setSubmitting(false) }
  }

  return (
    <section className="card" style={{ marginTop: '2rem' }}>
      <h2>Comments ({comments.length})</h2>

      {isAuthenticated()
        ? <div style={{ marginBottom: '1rem' }}>
          <textarea
            rows={3}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <button className="btn"
            onClick={submitComment}
            disabled={submitting || !newComment.trim()}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
        : <div className="card" style={{ textAlign: 'center' }}>
          <p>Login to comment</p>
          <button className="btn" onClick={() => navigate('/login')}>Login</button>
        </div>
      }

      {loading
        ? <p>Loading comments...</p>
        : comments.length === 0
          ? <p style={{ textAlign: 'center', color: '#6c757d' }}>No comments yet.</p>
          : comments.map(c => (
            <CommentItem
              key={c.commentId}
              comment={c}
              postId={postId}
              canManagePost={canManagePost}
              auth={auth}
              refresh={fetchComments}
            />
          ))
      }
    </section>
  )
}

function CommentItem({ comment, postId, canManagePost, auth, refresh }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.commentText)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const navigate = useNavigate()

  async function handleDelete() {
    const msg = auth?.role === 'Manager'
      ? prompt('Enter commit message:')
      : 'User deleted own comment'
    if (!msg) return
    await api.delete(`/comments/${comment.commentId}?commitMessage=${encodeURIComponent(msg)}`)
    refresh()
  }

  async function handleUpdate() {
    const msg = auth?.role === 'Manager'
      ? prompt('Enter commit message:')
      : null
    if (auth?.role === 'Manager' && !msg) return
    await api.put(`/comments/${comment.commentId}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`,
      { commentText: editText })
    setEditing(false)
    refresh()
  }

  async function handleReply() {
    if (!isAuthenticated()) return navigate('/login')
    if (!replyText.trim()) return
    await api.post('/comments', {
      postId,
      parentCommentId: comment.commentId,
      commentText: replyText.trim()
    })
    setReplyText('')
    setReplying(false)
    refresh()
  }

  // const isOwner = comment.userId === auth?.userId
  // const canEditDelete = canManagePost || isOwner

  return (
    <div className="comment" style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>
      <div className="comment-header flex justify-between">
        <div>
          <strong>{comment.authorName}</strong>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        {isAuthenticated() &&
          <div className="flex gap-2">
            <button className="btn btn-link" onClick={() => setEditing(true)}>✏ Edit</button>
            <button className="btn btn-link" onClick={handleDelete}>🗑 Delete</button>
          </div>
        }
      </div>

      <div className="comment-body">
        {editing
          ? <>
            <textarea value={editText} onChange={e => setEditText(e.target.value)}
              rows={2} style={{ width: '100%', marginBottom: '0.5rem' }} />
            <button className="btn btn-sm" onClick={handleUpdate}>Save</button>
            <button className="btn btn-link" onClick={() => setEditing(false)}>Cancel</button>
          </>
          : <p>{comment.commentText}</p>}
      </div>

      <div>
        <button className="btn btn-link" onClick={() => setReplying(!replying)}>💬 Reply</button>
      </div>

      {replying &&
        <div style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
            rows={2} style={{ width: '100%', marginBottom: '0.5rem' }} />
          <button className="btn btn-sm" onClick={handleReply} disabled={!replyText.trim()}>Post Reply</button>
          <button className="btn btn-link" onClick={() => setReplying(false)}>Cancel</button>
        </div>
      }

      {comment.replies?.length > 0 &&
        <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          {comment.replies.map(r => (
            <CommentItem
              key={r.commentId}
              comment={r}
              postId={postId}
              canManagePost={canManagePost}
              auth={auth}
              refresh={refresh}
            />
          ))}
        </div>
      }
    </div>
  )
}

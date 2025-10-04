import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import dayjs from 'dayjs'
import { isAuthenticated } from '../utils/auth'

export default function Comments({ postId, canManagePost, auth }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const navigate = useNavigate()

  // Reset when postId changes
  useEffect(() => {
    setComments([])
    setShowComments(false)
    setLoading(false)
    setNewComment('')
    setSubmitting(false)
  }, [postId])

  async function fetchComments() {
    try {
      setLoading(true)
      const res = await api.get(`/comments/post/${postId}?hierarchical=true`)
      setComments(res.data)
    } catch (err) {
      console.error("Failed to fetch comments:", err)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  async function submitComment() {
    if (!isAuthenticated()) return navigate('/login')
    if (!newComment.trim()) return
    try {
      setSubmitting(true)
      await api.post('/comments', { postId, commentText: newComment.trim() })
      setNewComment('')
      // ensure comments are visible and refreshed
      if (!showComments) setShowComments(true)
      await fetchComments()
    } catch (err) {
      console.error("Failed to post comment:", err)
    } finally {
      setSubmitting(false)
    }
  }

  function toggleComments() {
    // If turning on, fetch comments
    if (!showComments) {
      setShowComments(true)
      fetchComments()
      return
    }
    // If turning off, just hide (keep cached comments if user toggles back)
    setShowComments(false)
  }

  return (
    <section className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Comments </h2>
        <button className="btn" onClick={toggleComments}>
          {showComments ? 'Hide comments' : 'Show comments'}
        </button>
      </div>

      {showComments && (
        <>
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
            : <div className="card" style={{ textAlign: 'center', marginTop: '1rem' }}>
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
        </>
      )}
    </section>
  )
}

/**
 * CommentItem:
 * - shows comment content
 * - per-comment "View N replies" toggle (Instagram-like)
 * - lazy fetch replies if not present
 * - preserves existing edit/delete/vote/reply behaviors
 */
function CommentItem({ comment, postId, canManagePost, auth, refresh }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.commentText)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [voteCounts, setVoteCounts] = useState({ upvotes: 0, downvotes: 0 })
  const [userVote, setUserVote] = useState(null)
  const [replies, setReplies] = useState(comment.replies ?? null) // null = unknown / not loaded, [] = loaded but empty
  const [showReplies, setShowReplies] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const navigate = useNavigate()

  // Initialize vote counts when component mounts
  useEffect(() => {
    fetchVotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.commentId])

  // Keep editText in sync if comment prop changes
  useEffect(() => {
    setEditText(comment.commentText)
  }, [comment.commentText])

  async function fetchVotes() {
    try {
      const res = await api.get(`/votes/comment/${comment.commentId}/counts`)
      setVoteCounts(res.data)

      if (isAuthenticated()) {
        const userVoteRes = await api.get(`/votes/comment/${comment.commentId}/user-vote`)
        setUserVote(userVoteRes.data.vote)
      }
    } catch (err) {
      console.error("Failed to load votes:", err)
    }
  }

  async function handleVote(type) {
    if (!isAuthenticated()) return navigate('/login')
    try {
      const res = await api.post(`/votes/comment/${comment.commentId}/${type}`)
      setVoteCounts({ upvotes: res.data.upvotes, downvotes: res.data.downvotes })
      setUserVote(res.data.userVote)
    } catch (err) {
      console.error("Vote failed:", err)
    }
  }

  async function handleDelete() {
    const msg = auth?.role === 'Manager'
      ? prompt('Enter commit message:')
      : 'User deleted own comment'
    if (!msg) return
    try {
      await api.delete(`/comments/${comment.commentId}?commitMessage=${encodeURIComponent(msg)}`)
      refresh()
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  async function handleUpdate() {
    const msg = auth?.role === 'Manager'
      ? prompt('Enter commit message:')
      : null
    if (auth?.role === 'Manager' && !msg) return
    try {
      await api.put(`/comments/${comment.commentId}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`,
        { commentText: editText })
      setEditing(false)
      refresh()
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  // Lazy-load replies (if not already loaded)
  async function loadReplies() {
    if (replies !== null) return // already loaded (could be [])
    try {
      setLoadingReplies(true)
      const res = await api.get(`/comments/${comment.commentId}/replies`) // assumed endpoint
      // if API returns hierarchical objects, adjust accordingly
      setReplies(res.data ?? [])
    } catch (err) {
      console.error("Failed to load replies:", err)
      setReplies([]) // avoid re-trying endlessly
    } finally {
      setLoadingReplies(false)
    }
  }

  async function handleReply() {
    if (!isAuthenticated()) return navigate('/login')
    if (!replyText.trim()) return
    try {
      await api.post('/comments', {
        postId,
        parentCommentId: comment.commentId,
        commentText: replyText.trim()
      })
      setReplyText('')
      setReplying(false)
      // refresh replies area (either reload replies or refresh parent list)
      if (showReplies) {
        // reload replies if shown
        setReplies(null)
        await loadReplies()
      } else {
        // show replies and then load them
        setShowReplies(true)
        await loadReplies()
      }
      // also refresh top-level list counts / data
      refresh()
    } catch (err) {
      console.error("Reply failed:", err)
    }
  }

  // Toggle replies show/hide
  async function toggleReplies() {
    if (!showReplies) {
      // opening
      setShowReplies(true)
      await loadReplies()
    } else {
      setShowReplies(false)
    }
  }

  // helper to get reply count (prefers comment.replies length, falls back to comment.replyCount)
  function getReplyCount() {
    if (Array.isArray(comment.replies)) return comment.replies.length
    if (Array.isArray(replies)) return replies.length
    if (typeof comment.replyCount === 'number') return comment.replyCount
    return 0
  }

   const isOwner = String(comment.userId) === String(auth?.userId)
  const canManageComment = isOwner || (auth?.role === "Manager" && String(auth?.departmentId) === String(comment.deptId))
  console.log('canManageComment:', canManageComment, 'isOwner:', isOwner, 'auth:', auth, 'comment:', comment)  

  return (
    <div className="comment" style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>
      <div className="comment-header flex justify-between">
        <div>
          <strong>{comment.authorName}</strong>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        {isAuthenticated() && canManageComment &&
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

      {/* ✅ Upvote / Downvote UI */}
      <div className="flex gap-3" style={{ marginTop: '0.5rem' }}>
        <button
          className={`btn btn-sm ${userVote === 'upvote' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleVote("upvote")}
        >
          👍 {voteCounts.upvotes}
        </button>
        <button
          className={`btn btn-sm ${userVote === 'downvote' ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => handleVote("downvote")}
        >
          👎 {voteCounts.downvotes}
        </button>

        <button className="btn btn-link" onClick={() => setReplying(!replying)}>💬 Reply</button>

        {/* View replies toggle (Instagram-style) */}
        {getReplyCount() > 0 && (
          <button className="btn btn-link" onClick={toggleReplies}>
            {showReplies ? `Hide replies` : `View ${getReplyCount()} repl${getReplyCount() === 1 ? 'y' : 'ies'}`}
          </button>
        )}
      </div>

      {replying &&
        <div style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
            rows={2} style={{ width: '100%', marginBottom: '0.5rem' }} />
          <button className="btn btn-sm" onClick={handleReply} disabled={!replyText.trim()}>Post Reply</button>
          <button className="btn btn-link" onClick={() => setReplying(false)}>Cancel</button>
        </div>
      }

      {/* Replies area */}
      {showReplies && (
        <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          {loadingReplies
            ? <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Loading replies...</p>
            : (Array.isArray(replies) && replies.length > 0)
              ? replies.map(r => (
                <CommentItem
                  key={r.commentId}
                  comment={r}
                  postId={postId}
                  canManagePost={canManagePost}
                  auth={auth}
                  refresh={async () => {
                    // Refresh this replies list and top-level counts
                    setReplies(null)
                    await loadReplies()
                    refresh()
                  }}
                />
              ))
              : <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>No replies yet.</p>
          }
        </div>
      )}
    </div>
  )
}
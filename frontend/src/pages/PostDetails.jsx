import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../Components/Navbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { isAuthenticated, getAuth } from '../utils/auth'

dayjs.extend(relativeTime)

export default function PostDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const auth = getAuth()

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    try {
      setLoading(true)
      const response = await api.get(`/posts/${id}`)
      setPost(response.data)
    } catch (error) {
      console.error('Failed to fetch post:', error)
      if (error.response?.status === 404) {
        navigate('/feed')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(type) {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    try {
      setVoting(true)
      // ✅ use Votes API instead of /posts/{id}/vote
      await api.post(`/votes`, {
        postId: parseInt(id, 10),
        commentId: null,
        voteType: type
      })
      await fetchPost() // Refresh post data
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setVoting(false)
    }
  }

  async function handleRepost() {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    try {
      await api.post(`/posts/${id}/repost`)
      alert('Post reposted successfully!')
    } catch (error) {
      console.error('Failed to repost:', error)
      alert('Failed to repost')
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container loading">
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card" style={{ textAlign: 'center' }}>
            <h2>Post not found</h2>
            <button className="btn" onClick={() => navigate('/feed')}>
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <main className="container" style={{ marginTop: '2rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '1rem' }}
        >
          ← Back
        </button>

        <article className="card">
          <header
            style={{
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e9ecef',
              paddingBottom: '1rem'
            }}
          >
            <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>

            <div className="flex justify-between items-center">
              <div>
                <strong>{post.authorName}</strong>
                {post.department && <span> • {post.department}</span>}
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  {dayjs(post.createdAt).format('MMMM D, YYYY at h:mm A')}
                  <span style={{ marginLeft: '0.5rem' }}>
                    ({dayjs(post.createdAt).fromNow()})
                  </span>
                </div>
              </div>

              {isAuthenticated() && (
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline"
                    onClick={handleRepost}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    🔄 Repost
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Post Content */}
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.body}
            </ReactMarkdown>
          </div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '6px'
              }}
            >
              <h3 style={{ marginBottom: '1rem' }}>Attachments</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {post.attachments.map(attachment => (
                  <li key={attachment.attachmentId} style={{ marginBottom: '0.5rem' }}>
                    <a
                      href={`http://localhost:5157/${attachment.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2"
                    >
                      📎 {attachment.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Voting and Stats */}
          <footer
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '6px'
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  className={`btn ${voting ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => handleVote('upvote')}
                  disabled={voting || !isAuthenticated()}
                  title={!isAuthenticated() ? 'Login to vote' : 'Upvote'}
                >
                  ▲ {post.upvoteCount || 0}
                </button>
                <button
                  className={`btn ${voting ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => handleVote('downvote')}
                  disabled={voting || !isAuthenticated()}
                  title={!isAuthenticated() ? 'Login to vote' : 'Downvote'}
                >
                  ▼ {post.downvoteCount || 0}
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                💬 {post.commentsCount || 0} comments
              </div>
            </div>

            {!isAuthenticated() && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                  Want to vote or comment?
                </p>
                <button className="btn" onClick={() => navigate('/login')}>
                  Login to Participate
                </button>
              </div>
            )}
          </footer>
        </article>

        {/* Comments Section */}
        <Comments postId={post.postId} />
      </main>
    </div>
  )
}

function Comments({ postId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchComments()
  }, [postId])

  async function fetchComments() {
    try {
      setLoading(true)
      const response = await api.get(`/comments/post/${postId}?hierarchical=true`)
      setComments(response.data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  async function submitComment() {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      await api.post('/comments', {
        postId,
        commentText: newComment.trim()
      })
      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card" style={{ marginTop: '2rem' }}>
      <h2>Comments ({comments.length})</h2>

      {/* Comment Form */}
      {isAuthenticated() ? (
        <div style={{ marginBottom: '2rem' }}>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            style={{ marginBottom: '1rem' }}
          />
          <button
            className="btn"
            onClick={submitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      ) : (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '6px',
            textAlign: 'center'
          }}
        >
          <p>Want to join the discussion?</p>
          <button className="btn" onClick={() => navigate('/login')}>
            Login to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="loading">
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.commentId} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentItem({ comment, postId }) {
  const [voting, setVoting] = useState(false)
  const navigate = useNavigate()

  async function handleVote(type) {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    try {
      setVoting(true)
      // ✅ use Votes API with commentId
      await api.post(`/votes`, {
        postId: 0,
        commentId: comment.commentId,
        voteType: type
      })
      if (type === 'upvote') comment.upvoteCount++
      else if (type === 'downvote') comment.downvoteCount++
    } catch (error) {
      console.error('Failed to vote comment:', error)
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="comment" style={{ marginBottom: '1rem' }}>
      <div className="comment-header flex justify-between">
        <div>
          <strong>{comment.authorName}</strong>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={() => handleVote('upvote')}
            disabled={voting}
          >
            ▲ {comment.upvoteCount || 0}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => handleVote('downvote')}
            disabled={voting}
          >
            ▼ {comment.downvoteCount || 0}
          </button>
        </div>
      </div>

      <div className="comment-body">{comment.commentText}</div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies" style={{ marginLeft: '1rem' }}>
          {comment.replies.map(reply => (
            <CommentItem key={reply.commentId} comment={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  )
}
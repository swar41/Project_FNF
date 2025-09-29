import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../Components/Navbar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { isAuthenticated, getAuth } from '../utils/auth'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

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

  // async function fetchPost() {
  //   try {
  //     setLoading(true)
  //     const response = await api.get(`/posts/${id}`)
  //     setPost(response.data)
  //   } catch (error) {
  //     console.error('Failed to fetch post:', error)
  //     if (error.response?.status === 404) navigate('/feed')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  async function fetchPost() {
  try {
    setLoading(true)
    const response = await api.get(`/posts/${id}`)
    console.log('Fetched post data:', response.data)
    console.log('all keys:', Object.keys(response.data))
    console.log('Post body type:', typeof response.data.body)
    console.log('Post body value:', response.data.body)
    setPost(response.data)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    if (error.response?.status === 404) navigate('/feed')
  } finally {
    setLoading(false)
  }
}

  async function handleVote(type) {
    if (!isAuthenticated()) return navigate('/login')
    try {
      setVoting(true)
      await api.post(`/votes`, {
        postId: parseInt(id, 10),
        commentId: null,
        voteType: type
      })
      await fetchPost()
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setVoting(false)
    }
  }

  async function handleRepost() {
    if (!isAuthenticated()) return navigate('/login')
    try {
      await api.post(`/posts/${id}/repost`)
      alert('Post reposted!')
    } catch (error) {
      console.error('Repost failed:', error)
      alert('Repost failed')
    }
  }

  // function renderBlocks(bodyJson) {
  //   let blocks
  //   try {
  //     blocks = JSON.parse(bodyJson)
  //   } catch {
  //     return <p>{bodyJson}</p>
  //   }
  //   return blocks.map((block, idx) => {
  //     if (block.type === 'code') {
  //       return (
  //         <div key={idx} style={{ position: 'relative', marginBottom: '1rem' }}>
  //           <button
  //             className="btn btn-outline"
  //             style={{ position: 'absolute', right: '10px', top: '10px' }}
  //             onClick={() => navigator.clipboard.writeText(block.content)}
  //           >
  //             Copy Code
  //           </button>
  //           <SyntaxHighlighter language="python" showLineNumbers>
  //             {block.content}
  //           </SyntaxHighlighter>
  //         </div>
  //       )
  //     }
  //     return <p key={idx}>{block.content}</p>
  //   })
  // }

  function renderBlocks(bodyJson) {
  if (!bodyJson) return <p>No content available</p>
  
  let blocks
  try {
    // Check if it's already an object or needs parsing
    blocks = typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson
    
    // Validate it's an array
    if (!Array.isArray(blocks)) {
      return <p>{bodyJson}</p>
    }
  } catch (error) {
    console.error('Failed to parse body:', error)
    // If parsing fails, treat it as plain text
    return <div className="markdown-content">{bodyJson}</div>
  }
  
  return blocks.map((block, idx) => {
    if (block.type === 'code') {
      return (
        <div key={idx} style={{ position: 'relative', marginBottom: '1rem' }}>
          <button
            className="btn btn-outline"
            style={{ position: 'absolute', right: '10px', top: '10px' }}
            onClick={() => navigator.clipboard.writeText(block.content)}
          >
            Copy Code
          </button>
          <SyntaxHighlighter language="python" showLineNumbers>
            {block.content}
          </SyntaxHighlighter>
        </div>
      )
    }
    return <p key={idx} style={{ marginBottom: '1rem' }}>{block.content || ''}</p>
  })
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
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>

        <article className="card">
          <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>

            <div className="flex justify-between items-center">
              <div>
                <strong>{post.authorName}</strong>
                {post.department && <span> • {post.department}</span>}
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  {dayjs(post.createdAt).format('MMMM D, YYYY h:mm A')}
                  <span style={{ marginLeft: '0.5rem' }}>({dayjs(post.createdAt).fromNow()})</span>
                </div>
              </div>

              {isAuthenticated() && (
                <div className="flex gap-2">
                  <button className="btn btn-outline" onClick={handleRepost}>
                    🔄 Repost
                  </button>
                </div>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {post.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Body */}
          <div className="markdown-content">{renderBlocks(post.bodyPreview || post.body)}</div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <h3>Attachments</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {post.attachments.map(file => {
                  const url = `http://localhost:5157/${file.filePath}`
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName)
                  return (
                    <li key={file.attachmentId} style={{ marginBottom: '1rem' }}>
                      {isImage ? (
                        <img src={url} alt={file.fileName} style={{ maxWidth: '100%', borderRadius: '6px' }} />
                      ) : (
                        <a href={url} target="_blank" rel="noreferrer">
                          📎 {file.fileName}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Voting */}
          <footer style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  className={`btn ${voting ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => handleVote('Upvote')}
                  disabled={voting || !isAuthenticated()}
                >
                  ▲ {post.upvoteCount || 0}
                </button>
                <button
                  className={`btn ${voting ? 'btn-secondary' : 'btn-outline'}`}
                  onClick={() => handleVote('Downvote')}
                  disabled={voting || !isAuthenticated()}
                >
                  ▼ {post.downvoteCount || 0}
                </button>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>💬 {post.commentsCount || 0} comments</div>
            </div>
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
      const response = await api.get(
        `/comments/post/${postId}?hierarchical=true`
      )
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
            <CommentItem
              key={comment.commentId}
              comment={comment}
              postId={postId}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentItem({ comment, postId }) {
  const [voting, setVoting] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const navigate = useNavigate()

  async function handleVote(type) {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    try {
      setVoting(true)
      await api.post(`/votes`, {
        postId: postId,
        commentId: comment.commentId,
        voteType: type
      })
      if (type === 'Upvote') comment.upvoteCount++
      else if (type === 'Downvote') comment.downvoteCount++
    } catch (error) {
      console.error('Failed to vote comment:', error)
    } finally {
      setVoting(false)
    }
  }

  async function handleReplySubmit() {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    if (!replyText.trim()) return

    try {
      await api.post('/comments', {
        postId,
        parentCommentId: comment.commentId,
        commentText: replyText.trim()
      })
      setReplyText('')
      setReplying(false)
      window.location.reload() // reload comments (simple way)
    } catch (error) {
      console.error('Failed to post reply:', error)
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
            onClick={() => handleVote('Upvote')}
            disabled={voting}
          >
            ▲ {comment.upvoteCount || 0}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => handleVote('Downvote')}
            disabled={voting}
          >
            ▼ {comment.downvoteCount || 0}
          </button>
          <button
            className="btn btn-link"
            onClick={() => setReplying(!replying)}
          >
            💬 Reply
          </button>
        </div>
      </div>

      <div className="comment-body">{comment.commentText}</div>

      {/* Reply Form */}
      {replying && (
        <div style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            style={{ marginBottom: '0.5rem', width: '100%' }}
          />
          <button
            className="btn btn-sm"
            onClick={handleReplySubmit}
            disabled={!replyText.trim()}
          >
            Post Reply
          </button>
          <button
            className="btn btn-link"
            onClick={() => setReplying(false)}
            style={{ marginLeft: '0.5rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Replies toggle */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}>
          {!showReplies ? (
            <button
              className="btn btn-link"
              style={{
                fontSize: '0.85rem',
                padding: 0,
                color: '#007bff',
                background: 'none',
                border: 'none'
              }}
              onClick={() => setShowReplies(true)}
            >
              View replies ({comment.replies.length})
            </button>
          ) : (
            <div className="comment-replies" style={{ marginLeft: '1rem' }}>
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.commentId}
                  comment={reply}
                  postId={postId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
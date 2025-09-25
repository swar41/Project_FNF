import React from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function PostCard({ post }) {
  const truncateContent = (content, maxLength = 200) => {
    if (!content) return ''
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content
  }

  return (
    <div className="post-card">
      {post.isRepost && (
        <div
          style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}
        >
          🔄 Reposted by {post.repostedBy}
        </div>
      )}

      <Link to={`/post/${post.postId || post.id}`} className="post-title">
        {post.title}
      </Link>

      <div className="post-preview">
        {truncateContent(post.bodyPreview || post.content || post.body)}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-meta">
        <div>
          <strong>{post.authorName || post.author}</strong>
          {post.dept && <span> • {post.dept}</span>}
          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            {dayjs(post.createdAt || post.datetime).fromNow()}
          </div>
        </div>

        <div className="post-stats">
          <span title="Upvotes">▲ {post.upvoteCount || post.upvotes || 0}</span>
          <span title="Downvotes">▼ {post.downvoteCount || post.downvotes || 0}</span>
          <span title="Comments">💬 {post.commentsCount || post.comments || 0}</span>
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function PostCard({ post }) {
  const truncateContent = (text, maxLength = 200) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Fixed preview extraction function
  function getPreview(body) {
    if (!body) return 'No content available'
    
    try {
      // Try to parse as JSON first (structured content)
      const blocks = JSON.parse(body)
      if (Array.isArray(blocks) && blocks.length > 0) {
        // Find the first text block for preview
        const firstTextBlock = blocks.find(b => b.type === 'text' && b.content && b.content.trim())
        if (firstTextBlock) {
          return firstTextBlock.content
        }
        
        // If no text blocks, show indication of code content
        const hasCodeBlock = blocks.find(b => b.type === 'code')
        if (hasCodeBlock) {
          return '[Contains code snippet]'
        }
        
        // Fallback: show first block's content regardless of type
        if (blocks[0] && blocks[0].content) {
          return blocks[0].type === 'code' ? '[Code snippet]' : blocks[0].content
        }
      }
      return 'No content available'
    } catch {
      // If JSON parsing fails, treat as plain text
      return body.trim() || 'No content available'
    }
  }

  // Use multiple fallbacks for preview content
  const preview = post.bodyPreview || 
                 post.content || 
                 getPreview(post.body) || 
                 'No content available'

  return (
    <div className="post-card">
      {post.isRepost && (
        <div
          style={{
            fontSize: '0.85rem',
            color: '#6c757d',
            marginBottom: '0.5rem'
          }}
        >
          🔄 Reposted by {post.repostedBy}
        </div>
      )}

      <Link to={`/post/${post.postId || post.id}`} className="post-title">
        {post.title || 'Untitled Post'}
      </Link>

      <div className="post-preview">
        {truncateContent(preview)}
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
          <strong>{post.authorName || post.author || 'Unknown Author'}</strong>
          {(post.department || post.dept) && <span> • {post.department || post.dept}</span>}
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
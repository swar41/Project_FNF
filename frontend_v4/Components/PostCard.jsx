import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function PostCard({ post }) {
  function getPreview(body) {
    if (!body) return 'No content available';

    try {
      const blocks = JSON.parse(body);
      if (Array.isArray(blocks)) {
        const textBlocks = blocks
          .filter(b => b.type === 'text' && b.content && b.content.trim());

        let previewText = textBlocks.slice(0, 2).map(b => b.content.trim()).join(' ');

        // If only one text block and there's a code block after it, add a hint
        if (textBlocks.length < 2) {
          const hasCodeBlock = blocks.find(b => b.type === 'code');
          if (hasCodeBlock) {
            previewText += ' [Contains code snippet]';
          }
        }

        return previewText || 'No content available';
      }

      return 'No content available';
    } catch {
      // If JSON parsing fails, treat as plain text
      return body.substring(0, 200).trim() || 'No content available';
    }
  }

  // ✅ Always parse the body to extract text content
  const preview = getPreview(post.body || post.bodyPreview || post.content);
  
  // Truncate if too long
  const truncatedPreview = preview.length > 200 
    ? preview.substring(0, 200) + '...' 
    : preview;

  return (
    <div className="post-card">
      {post.isRepost && (
        <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
          🔄 Reposted by {post.repostedBy}
        </div>
      )}

      <Link to={`/post/${post.postId || post.id}`} className="post-title">
        {post.title || 'Untitled Post'}
      </Link>

      <div className="post-preview">{truncatedPreview}</div>

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
          <span title="Comments">💬 {post.commentsCount ?? post.comments?.length ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/global.css';

dayjs.extend(relativeTime);

export default function PostCard({ post }) {
  // console.log('raw post data:', post);

  // Function to extract and truncate preview text
  function getPreview(post) {
    // Try full body first (complete JSON), fallback to bodyPreview (truncated)
    let body = post.body || post.content || post.bodyPreview;
    if (!body) return 'No content available';

    try {
      // Parse the JSON string to get the content array
      const parsed = JSON.parse(body);
      
      if (Array.isArray(parsed)) {
        // Extract only text-type content blocks
        const textBlocks = parsed
          .filter(b => b.type === 'text' && b.content)
          .map(b => {
            // Replace literal \n with spaces and clean up whitespace
            return b.content
              .replace(/\\n/g, ' ')  // escaped newlines
              .replace(/\n/g, ' ')   // actual newlines
              .replace(/\s+/g, ' ')  // multiple spaces
              .trim();
          });
        
        if (textBlocks.length > 0) {
          const fullText = textBlocks.join(' ');
          return truncatePreview(fullText);
        }
      }
    } catch (e) {
      // If JSON parsing fails, it might be plain text or truncated preview
      console.log('Could not parse as JSON, treating as plain text');
      const cleanText = String(body)
        .replace(/\\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^[\[{].*?["']content["']\s*:\s*["']/, '') // Remove JSON prefix if partial
        .replace(/["'].*$/, '') // Remove JSON suffix if partial
        .trim();
      return truncatePreview(cleanText);
    }

    return 'No content available';
  }

  function truncatePreview(text) {
    // Remove any trailing "..." from the original preview
    text = text.replace(/\.{3}$/g, '').trim();
    
    return text.length > 250 
      ? text.substring(0, 250).trim() + '...' 
      : text;
  }

  const preview = getPreview(post);

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
      
      <div className="post-preview">{preview}</div>
      
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
          <strong>{post.authorName || 'Unknown Author'}</strong>
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
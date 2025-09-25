
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../Components/Navbar'

export default function NewPost() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!title.trim() || !body.trim()) {
      alert('Please fill in both title and content')
      return
    }

    try {
      setSubmitting(true)
      
      const formData = new FormData()
      formData.append('Title', title.trim())
      formData.append('Body', body.trim())
      
      // Handle tags
      const tagList = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      tagList.forEach(tag => formData.append('Tags', tag))
      
      // Handle file attachments
      for (const file of files) {
        formData.append('Attachments', file)
      }

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Redirect to the created post
      navigate(`/post/${response.data.postId}`)
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files)
    
    // Basic file validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      return true
    })
    
    setFiles(validFiles)
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index))
  }

  const previewContent = body.split('\n').map((line, i) => (
    <p key={i}>{line || <br />}</p>
  ))

  return (
    <div>
      <Navbar />
      
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1>Create New Post</h1>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/feed')}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            {/* Title Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Title *
              </label>
              <input
                type="text"
                placeholder="Enter a descriptive title for your post"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                required
              />
              <div style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'right' }}>
                {title.length}/200
              </div>
            </div>

            {/* Content Editor */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>
                  Content * 
                  <span style={{ fontWeight: 'normal', color: '#6c757d' }}>
                    (Markdown supported)
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {showPreview ? (
                <div 
                  className="markdown-content"
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    padding: '1rem',
                    minHeight: '300px',
                    background: '#f8f9fa'
                  }}
                >
                  {body ? previewContent : <p style={{ color: '#6c757d' }}>Preview will appear here...</p>}
                </div>
              ) : (
                <textarea
                  placeholder="Describe your problem, solution, or knowledge here. You can use Markdown formatting."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={12}
                  required
                />
              )}

              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                💡 Tip: Use **bold**, *italic*, `code`, and [links](url) for better formatting
              </div>
            </div>

            {/* Tags Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags separated by commas (e.g., VPN, IT, Security)"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                Tags help others find your post. Use relevant keywords.
              </div>
            </div>

            {/* File Attachments */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
              />
              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                Maximum 10MB per file. Supported: PDF, DOC, TXT, images
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Selected Files:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {files.map((file, index) => (
                      <li 
                        key={index} 
                        className="flex justify-between items-center"
                        style={{ 
                          padding: '0.5rem', 
                          background: '#f8f9fa', 
                          borderRadius: '4px', 
                          marginBottom: '0.5rem' 
                        }}
                      >
                        <span style={{ fontSize: '0.9rem' }}>
                          📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#dc3545', 
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="btn"
                disabled={submitting || !title.trim() || !body.trim()}
              >
                {submitting ? 'Creating Post...' : 'Create Post'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/feed')}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Markdown Help */}
        <div className="card" style={{ marginTop: '2rem', background: '#f8f9fa' }}>
          <h3>Markdown Quick Reference</h3>
          <div style={{ fontSize: '0.9rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Headers:</strong><br />
              # H1<br />
              ## H2<br />
              ### H3
            </div>
            <div>
              <strong>Text Format:</strong><br />
              **bold text**<br />
              *italic text*<br />
              `inline code`
            </div>
            <div>
              <strong>Lists:</strong><br />
              - Item 1<br />
              - Item 2<br />
              1. Numbered item
            </div>
            <div>
              <strong>Links & Images:</strong><br />
              [Link text](URL)<br />
              ![Image](URL)<br />
              [Email](mailto:user@example.com)
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
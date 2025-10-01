import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

export default function NewPost() {
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState([]) // [{type:"text", content:"..."}, {type:"code", content:"..."}]
  const [input, setInput] = useState('')
  const [isCode, setIsCode] = useState(false)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // 🔹 Fetch tag suggestions
  useEffect(() => {
    if (!tagInput.trim()) {
      setTagSuggestions([])
      return
    }
    fetchTagSuggestions(tagInput)
  }, [tagInput])

  async function fetchTagSuggestions(query) {
    try {
      const res = await api.get(`/tags`)
      const allTags = res.data.$values ? res.data.$values : res.data
      const filtered = allTags.filter(t =>
        t.tagName.toLowerCase().includes(query.toLowerCase())
      )
      setTagSuggestions(filtered)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      setTagSuggestions([])
    }
  }

  function addBlock() {
    if (!input.trim()) return
    const newBlock = isCode
      ? { type: 'code', content: input }
      : { type: 'text', content: input }
    setBlocks([...blocks, newBlock])
    setInput('')
  }

  function removeBlock(index) {
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files)
    const maxSize = 10 * 1024 * 1024
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Max size is 10MB.`)
        return false
      }
      return true
    })
    setFiles(validFiles)
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index))
  }

  function addTag(tag) {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput('')
    setTagSuggestions([])
  }

  function removeTag(tag) {
    setTags(tags.filter(t => t !== tag))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || blocks.length === 0) {
      alert('Please fill in title and content')
      return
    }

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append('Title', title.trim())
      formData.append('Body', JSON.stringify(blocks))

      // Tags
      if (tags && tags.length > 0) {
        tags.forEach(tag => formData.append('Tags', tag))
      }

      // Attachments
      if (files && files.length > 0) {
        for (const file of files) {
          formData.append('Attachments', file)
        }
      }

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate(`/post/${res.data.postId}`)
    } catch (err) {
      console.error('Failed to create post:', err)
      alert(err?.response?.data?.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1>Create New Post</h1>
          <button className="btn btn-outline" onClick={() => navigate('/feed')}>
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            {/* Title */}
            <label style={{ fontWeight: 'bold' }}>Title *</label>
            <input
              type="text"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'right' }}>
              {title.length}/200
            </div>

            {/* Block Editor */}
            <div style={{ margin: '1rem 0' }}>
              <label style={{ fontWeight: 'bold' }}>Content *</label>
              <textarea
                rows={6}
                placeholder={isCode ? 'Write code snippet here...' : 'Write text content here...'}
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCode(!isCode)}
                >
                  {isCode ? 'Switch to Text' : 'Add Code Snippet'}
                </button>
                <button type="button" className="btn" onClick={addBlock}>
                  Add Block
                </button>
              </div>
            </div>

            {/* Preview */}
            {blocks.length > 0 && (
              <div className="card" style={{ background: '#f8f9fa', marginTop: '1rem' }}>
                {blocks.map((block, idx) =>
                  block.type === 'code' ? (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <SyntaxHighlighter language="javascript" showLineNumbers>
                        {block.content}
                      </SyntaxHighlighter>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeBlock(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div key={idx} style={{ marginBottom: '0.5rem' }}>
                      <p>{block.content}</p>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeBlock(idx)}
                        style={{ marginTop: '0.25rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Tags */}
            <label style={{ fontWeight: 'bold', marginTop: '1rem' }}>Tags</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type and select tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
              />
              {tagSuggestions.length > 0 && (
                <ul
                  style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '0.25rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    position: 'absolute',
                    zIndex: 1000,
                    width: '100%'
                  }}
                >
                  {tagSuggestions.map(s => (
                    <li
                      key={s.tagId}
                      style={{ padding: '0.5rem', cursor: 'pointer' }}
                      onClick={() => addTag(s.tagName)}
                    >
                      {s.tagName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              {tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}{' '}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{ marginLeft: '0.25rem' }}
                  >
                    ✖
                  </button>
                </span>
              ))}
            </div>

            {/* Attachments */}
            <label style={{ fontWeight: 'bold', marginTop: '1rem' }}>Attachments</label>
            <input type="file" multiple onChange={handleFileChange} />
            {files.length > 0 && (
              <ul>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name}{' '}
                    <button type="button" onClick={() => removeFile(i)}>
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn"
              disabled={submitting || !title.trim() || blocks.length === 0}
              style={{ marginTop: '1rem' }}
            >
              {submitting ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
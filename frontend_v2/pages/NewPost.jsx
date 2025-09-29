

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../Components/Navbar'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

export default function NewPost() {
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState([]) // [{type:"text", content:"..."}, {type:"code", content:"..."}]
  const [input, setInput] = useState('')
  const [isCode, setIsCode] = useState(false)
  const [tags, setTags] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

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
      formData.append('Body', JSON.stringify(blocks)) // store JSON

      const tagList = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
      tagList.forEach(tag => formData.append('Tags', tag))

      for (const file of files) {
        formData.append('Attachments', file)
      }

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate(`/post/${response.data.postId}`)
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post.')
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
                <button type="button" className="btn btn-outline" onClick={() => setIsCode(!isCode)}>
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
                      <button type="button" className="btn btn-secondary" onClick={() => removeBlock(idx)}>
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
            <input
              type="text"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />

            {/* Attachments */}
            <label style={{ fontWeight: 'bold', marginTop: '1rem' }}>Attachments</label>
            <input type="file" multiple onChange={handleFileChange} />
            {files.length > 0 && (
              <ul>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name}{' '}
                    <button type="button" onClick={() => removeFile(i)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Submit */}
            <button type="submit" className="btn" disabled={submitting || !title.trim() || blocks.length === 0}>
              {submitting ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
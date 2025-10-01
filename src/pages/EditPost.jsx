import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { getAuth } from '../utils/auth'
import '../styles/global.css'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState([])
  const [input, setInput] = useState('')
  const [isCode, setIsCode] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const auth = getAuth()

  useEffect(() => { fetchPost() }, [id])

  async function fetchPost() {
    try {
      setLoading(true)
      const res = await api.get(`/posts/${id}`)
      const data = res.data
      setTitle(data.title)
      try {
        const bodyBlocks = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
        setBlocks(Array.isArray(bodyBlocks) ? bodyBlocks : [{ type: 'text', content: data.body }])
      } catch {
        setBlocks([{ type: 'text', content: data.body }])
      }
      setTags(data.tags || [])
    } catch (err) {
      console.error('Failed to load post:', err)
      navigate('/feed')
    } finally { setLoading(false) }
  }

  function addOrUpdateBlock() {
    if (!input.trim()) return
    const newBlock = isCode
      ? { type: 'code', content: input }
      : { type: 'text', content: input }

    if (editingIndex !== null) {
      const updated = [...blocks]
      updated[editingIndex] = newBlock
      setBlocks(updated)
      setEditingIndex(null)
    } else {
      setBlocks([...blocks, newBlock])
    }
    setInput('')
    setIsCode(false)
  }

  function editBlock(idx) {
    setInput(blocks[idx].content)
    setIsCode(blocks[idx].type === 'code')
    setEditingIndex(idx)
  }

  function cancelEdit() {
    setInput('')
    setIsCode(false)
    setEditingIndex(null)
  }

  function removeBlock(idx) {
    setBlocks(blocks.filter((_, i) => i !== idx))
    if (editingIndex === idx) cancelEdit()
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  function addTag(tag) {
    if (!tag.trim()) return
    if (!tags.includes(tag)) setTags([...tags, tag])
    setTagInput('')
  }

  function removeTag(tag) {
    setTags(tags.filter(t => t !== tag))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || blocks.length === 0) {
      alert('Please fill title and content')
      return
    }

    try {
      setSubmitting(true)
      const msg = auth?.role === 'Manager' ? prompt('Enter commit message:') : null
      if (auth?.role === 'Manager' && !msg) return

      const payload = {
        title: title.trim(),
        body: JSON.stringify(blocks),
        tags: tags
      }

      const url = `/posts/${id}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`

      await api.put(url, payload, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (files.length > 0) {
        const formData = new FormData()
        files.forEach(f => formData.append('files', f))
        await api.post(`/posts/${id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      alert('Post updated!')
      navigate(`/post/${id}`)
    } catch (err) {
      console.error('Failed to update post:', err)
      console.error('Error details:', err.response?.data)
      alert(`Failed to update post: ${err.response?.data?.message || err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <><Navbar /><div className="container">Loading post...</div></>

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <h1>Edit Post</h1>
        <form onSubmit={handleSubmit} className="card">
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            required
          />

          <label style={{ marginTop: '1rem' }}>Content *</label>
          <textarea
            rows={6}
            placeholder={isCode ? 'Write code here...' : 'Write text here...'}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCode(!isCode)}>
              {isCode ? 'Switch to Text' : 'Add Code Snippet'}
            </button>
            <button type="button" className="btn" onClick={addOrUpdateBlock}>
              {editingIndex !== null ? 'Save Changes' : 'Add Block'}
            </button>
            {editingIndex !== null && (
              <button type="button" className="btn btn-link" onClick={cancelEdit}>Cancel Edit</button>
            )}
          </div>

          {blocks.length > 0 && (
            <div className="card" style={{ background: '#f8f9fa', marginTop: '1rem' }}>
              {blocks.map((b, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  {b.type === 'code'
                    ? <SyntaxHighlighter language="javascript" showLineNumbers>{b.content}</SyntaxHighlighter>
                    : <p>{b.content}</p>}
                  <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-outline" onClick={() => editBlock(i)}>✏ Edit</button>
                    <button type="button" className="btn btn-secondary" onClick={() => removeBlock(i)}>🗑 Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label style={{ marginTop: '1rem' }}>Tags</label>
          <input
            type="text"
            placeholder="Enter tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
          />
          <button type="button" className="btn btn-sm" onClick={() => addTag(tagInput)}>Add Tag</button>
          <div style={{ marginTop: '0.5rem' }}>
            {tags.map((t, i) => (
              <span key={i} className="tag">
                {t}{' '}
                <button type="button" onClick={() => removeTag(t)}>✖</button>
              </span>
            ))}
          </div>

          <label style={{ marginTop: '1rem' }}>Attachments</label>
          <input type="file" multiple onChange={handleFileChange} />
          {files.length > 0 && (
            <ul>{files.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
          )}

          <button
            type="submit"
            className="btn"
            disabled={submitting}
            style={{ marginTop: '1rem' }}
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  )
}
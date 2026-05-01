'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('web')
  const [image, setImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin' && password === 'admin') {
      setIsLoggedIn(true)
      setError('')
    } else {
      setError('Invalid credentials')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null
    
    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `projects/${fileName}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, image)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setMessage('')

    try {
      let imageUrl = null
      
      if (image) {
        imageUrl = await uploadImage()
      }

      const { error } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            category,
            image: imageUrl || 'https://via.seifportfolio.com/300'
          }
        ])

      if (error) throw error

      setMessage('Project added successfully!')
      setTitle('')
      setDescription('')
      setCategory('web')
      setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setMessage(`Error: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="bg-[#0d0d18] p-8 rounded-lg border border-[rgba(185,239,163,0.2)] max-w-md w-full">
          <h1 className="font-display text-3xl text-white mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-[#8888aa] text-sm mb-2">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-[#0a0a0f] border border-[rgba(185,239,163,0.2)] text-white rounded focus:border-[#b9efa3] outline-none"
                placeholder="admin"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[#8888aa] text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#0a0a0f] border border-[rgba(185,239,163,0.2)] text-white rounded focus:border-[#b9efa3] outline-none"
                placeholder="admin"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#b9efa3] text-[#161f6e] py-3 rounded font-semibold hover:bg-[#a8de92] transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-4xl text-white">Admin Panel</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-[#8888aa] hover:text-[#b9efa3] transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-[#0d0d18] p-8 rounded-lg border border-[rgba(185,239,163,0.2)]">
          <h2 className="font-display text-2xl text-white mb-6">Add New Project</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[#8888aa] text-sm mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-3 bg-[#0a0a0f] border border-[rgba(185,239,163,0.2)] text-white rounded focus:border-[#b9efa3] outline-none"
                placeholder="Project Title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[#8888aa] text-sm mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full p-3 bg-[#0a0a0f] border border-[rgba(185,239,163,0.2)] text-white rounded focus:border-[#b9efa3] outline-none resize-none"
                placeholder="Project description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[#8888aa] text-sm mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-[#0a0a0f] border border-[rgba(185,239,163,0.2)] text-white rounded focus:border-[#b9efa3] outline-none"
              >
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="design">Design</option>
                <option value="branding">Branding</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-[#8888aa] text-sm mb-2">Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 bg-[#0a0a0f] border border-[rgba(185,239,163,0.2)] text-white rounded focus:border-[#b9efa3] outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#b9efa3] file:text-[#161f6e] file:cursor-pointer"
              />
              {image && (
                <p className="text-[#8888aa] text-sm mt-2">Selected: {image.name}</p>
              )}
            </div>

            {message && (
              <p className={`mb-4 text-sm ${message.includes('Error') ? 'text-red-500' : 'text-[#b9efa3]'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#b9efa3] text-[#161f6e] py-3 rounded font-semibold hover:bg-[#a8de92] transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Add Project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

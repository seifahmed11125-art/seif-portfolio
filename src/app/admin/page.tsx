'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { type Session } from '@supabase/supabase-js'
import { AI_VIDEOS_CATEGORY, categories, type Category } from '@/data/portfolio'
import {
  MAX_PROJECT_COVER_BYTES, MAX_PROJECT_VIDEO_BYTES, MAX_PROJECT_VIDEO_MB, parseProjectLink, projectVideoType,
} from '@/lib/projectMedia'
import { supabase } from '@/lib/supabase'
import { adminAccessToken, uploadProjectVideo } from './projectUpload'

const labelClass = 'block text-[#8888aa] text-sm mb-2'
const inputClass = 'w-full rounded border border-[rgba(185,239,163,0.2)] bg-[#0a0a0f] p-3 text-white outline-none focus:border-[#b9efa3]'
const fileClass = inputClass + ' file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-[#b9efa3] file:px-3 file:py-2 file:text-[#161f6e]'
const buttonClass = 'w-full rounded bg-[#b9efa3] py-3 font-semibold text-[#161f6e] transition-colors hover:bg-[#a8de92] disabled:opacity-50'
const panelClass = 'rounded-lg border border-[rgba(185,239,163,0.2)] bg-[#0d0d18] p-5 sm:p-8'

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [category, setCategory] = useState<Category>('Brand Identity')
  const [uploading, setUploading] = useState(false)
  const [uploadPercent, setUploadPercent] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const projectIdRef = useRef<string | null>(null)
  const isVideoProject = category === AI_VIDEOS_CATEGORY

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setCheckingSession(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSigningIn(true)
    setLoginError('')

    const form = new FormData(event.currentTarget)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get('email')).trim(),
        password: String(form.get('password')),
      })
      if (error) setLoginError('Could not sign in. Check your email and password.')
    } catch {
      setLoginError('Could not sign in. Please try again.')
    } finally {
      setSigningIn(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (uploading) return

    const form = event.currentTarget
    const body = new FormData(form)
    const cover = body.get('image')
    const video = body.get('video')
    body.delete('video')
    setUploading(true)
    setMessage(null)

    try {
      const link = parseProjectLink(String(body.get('external_link') ?? '').trim())
      if (!String(body.get('title') ?? '').trim() || !String(body.get('description') ?? '').trim() || !link) {
        throw new Error('Enter a title, description, and a valid project link.')
      }
      const hasCover = cover instanceof File && cover.size > 0
      if (hasCover && cover.size > MAX_PROJECT_COVER_BYTES) throw new Error('Choose a cover image up to 3 MB.')
      if (!hasCover) body.delete('image')

      const projectId = projectIdRef.current ??= crypto.randomUUID()
      if (video instanceof File && video.size > 0) {
        const type = projectVideoType(video)
        if (!type || video.size > MAX_PROJECT_VIDEO_BYTES) {
          throw new Error('Choose an MP4 or WebM file up to ' + MAX_PROJECT_VIDEO_MB + ' MB.')
        }
        if (!hasCover) throw new Error('Choose a cover image for the video.')

        setUploadPercent(0)
        await uploadProjectVideo(projectId, video, type, await adminAccessToken(), setUploadPercent)
        body.set('video_type', type)
      }

      setUploadPercent(null)
      body.set('id', projectId)
      body.set('external_link', link.href)

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + await adminAccessToken() },
        body,
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Could not publish the project. Please try again.')
      }

      setMessage({ text: 'Project published successfully.' })
      projectIdRef.current = null
      form.reset()
      setCategory('Brand Identity')
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Upload failed. Please try again.', error: true })
    } finally {
      setUploading(false)
      setUploadPercent(null)
    }
  }

  if (checkingSession) {
    return <p className="p-8 text-[#b9efa3]" role="status">Loading admin panel…</p>
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4">
        <div className={panelClass + ' w-full max-w-md'}>
          <h1 className="font-display mb-6 text-center text-3xl text-white">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className={labelClass}>Email</label>
              <input id="admin-email" name="email" type="email" required autoComplete="username" className={inputClass} />
            </div>
            <div>
              <label htmlFor="admin-password" className={labelClass}>Password</label>
              <input id="admin-password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
            </div>
            {loginError && <p className="text-sm text-red-500" role="alert">{loginError}</p>}
            <button type="submit" disabled={signingIn} className={buttonClass}>
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-white sm:text-4xl">Admin Panel</h1>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            disabled={uploading}
            className="text-[#8888aa] transition-colors hover:text-[#b9efa3] disabled:opacity-50"
          >
            Logout
          </button>
        </div>

        {session.user.app_metadata.portfolio_admin === true ? (
          <div className={panelClass}>
            <h2 className="font-display mb-6 text-2xl text-white">Add New Project</h2>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={uploading} className="min-w-0 space-y-4">
                <div>
                  <label htmlFor="project-title" className={labelClass}>Title</label>
                  <input id="project-title" name="title" type="text" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="project-category" className={labelClass}>Category</label>
                  <select
                    id="project-category"
                    name="category"
                    value={category}
                    onChange={(event) => {
                      projectIdRef.current = null
                      setCategory(event.target.value as Category)
                    }}
                    className={inputClass}
                  >
                    {categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="external-link" className={labelClass}>
                    {isVideoProject ? 'Behance / Project Link' : 'External Link'}
                  </label>
                  <input id="external-link" name="external_link" type="url" required className={inputClass} placeholder="https://www.behance.net/gallery/…" />
                </div>
                <div>
                  <label htmlFor="project-description" className={labelClass}>Description</label>
                  <textarea id="project-description" name="description" required rows={3} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="project-cover" className={labelClass}>Cover Image</label>
                  <input
                    id="project-cover"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                    aria-describedby="cover-help"
                    onChange={() => { projectIdRef.current = null }}
                    className={fileClass}
                  />
                  <p id="cover-help" className="mt-2 text-sm text-[#8888aa]">Up to 3 MB.{isVideoProject && ' Required when uploading a video.'}</p>
                </div>
                {isVideoProject && (
                  <div>
                    <label htmlFor="project-video" className={labelClass}>Video File</label>
                    <input
                      id="project-video"
                      name="video"
                      type="file"
                      accept=".mp4,.webm,video/mp4,video/webm"
                      aria-describedby="video-help"
                      onChange={() => { projectIdRef.current = null }}
                      className={fileClass}
                    />
                    <p id="video-help" className="mt-2 text-sm text-[#8888aa]">
                      Optional. MP4 (H.264 recommended) or WebM up to {MAX_PROJECT_VIDEO_MB} MB.
                    </p>
                  </div>
                )}
              </fieldset>

              {uploadPercent !== null && (
                <div className="mt-4 text-sm text-[#b9efa3]">
                  <label htmlFor="upload-progress">Uploading video… {uploadPercent}%</label>
                  <progress id="upload-progress" className="mt-2 block w-full accent-[#b9efa3]" value={uploadPercent} max={100} />
                </div>
              )}
              {message && (
                <p className={'mt-4 text-sm ' + (message.error ? 'text-red-500' : 'text-[#b9efa3]')} role="status">{message.text}</p>
              )}
              <button type="submit" disabled={uploading} className={buttonClass + ' mt-6'}>
                {uploading ? (uploadPercent === null ? 'Publishing…' : 'Uploading…') : 'Add Project'}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-[#8888aa]" role="alert">This account cannot publish portfolio projects.</p>
        )}
      </div>
    </main>
  )
}

'use client'

import { useRef, useState } from 'react'
import { Play } from 'lucide-react'

interface ProjectVideoProps {
  title: string
  coverUrl?: string | null
  videoUrl?: string
  externalUrl?: string
}

export default function ProjectVideo({ title, coverUrl, videoUrl, externalUrl }: ProjectVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [failed, setFailed] = useState(false)

  async function play() {
    const video = videoRef.current
    if (!video || !videoUrl) return

    setHasStarted(true)
    setFailed(false)
    if (!video.hasAttribute('src') || video.error) video.src = videoUrl
    video.tabIndex = 0
    video.focus({ preventScroll: true })
    try {
      await video.play()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setFailed(true)
        setHasStarted(false)
      }
    }
  }

  const cover = coverUrl && (
    <>
      <img className="project-video-backdrop" src={coverUrl} alt="" loading="lazy" decoding="async" />
      <img className="project-video-cover" src={coverUrl} alt="" loading="lazy" decoding="async" />
    </>
  )
  const playIcon = <span className="project-video-play-icon"><Play aria-hidden="true" size={25} fill="currentColor" /></span>

  if (!videoUrl) {
    return (
      <div className="project-image project-video">
        {externalUrl ? (
          <a className="project-video-play" href={externalUrl} target="_blank" rel="noopener noreferrer" aria-label={'Watch ' + title + ' on an external site'}>
            {cover}
            {playIcon}
          </a>
        ) : cover}
      </div>
    )
  }

  return (
    <div className="project-image project-video">
      <video
        ref={videoRef}
        className="project-video-player"
        poster={hasStarted ? coverUrl || undefined : undefined}
        controls={hasStarted}
        playsInline
        preload="none"
        aria-label={title}
        aria-hidden={!hasStarted}
        tabIndex={hasStarted ? 0 : -1}
        onError={() => {
          setFailed(true)
          setHasStarted(false)
        }}
      />
      {!hasStarted && (
        <button className="project-video-play" type="button" onClick={play} aria-label={'Play ' + title}>
          {cover}
          {playIcon}
        </button>
      )}
      {failed && <p className="project-video-error" role="status">Could not play this video. Try again.</p>}
    </div>
  )
}

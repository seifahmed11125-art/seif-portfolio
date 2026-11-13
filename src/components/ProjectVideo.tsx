'use client'

import { useRef, useState } from 'react'
import { Play } from 'lucide-react'

interface ProjectVideoProps {
  title: string
  coverUrl?: string | null
  videoUrl: string
}

export default function ProjectVideo({ title, coverUrl, videoUrl }: ProjectVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [failed, setFailed] = useState(false)

  async function play() {
    const video = videoRef.current
    if (!video) return

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
          {coverUrl && <img src={coverUrl} alt="" loading="lazy" decoding="async" />}
          <span className="project-video-play-icon"><Play aria-hidden="true" size={25} fill="currentColor" /></span>
        </button>
      )}
      {failed && <p className="project-video-error" role="status">Could not play this video. Try again.</p>}
    </div>
  )
}

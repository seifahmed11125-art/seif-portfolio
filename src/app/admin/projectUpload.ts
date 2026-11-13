import { supabase } from '@/lib/supabase'
import {
  PROJECT_MEDIA_CACHE_SECONDS, PROJECT_VIDEO_BUCKET, type ProjectVideoType,
} from '@/lib/projectMedia'

type VideoUploadTarget =
  | { uploaded: true }
  | { path: string; token: string }

export async function uploadProjectVideo(
  projectId: string,
  file: File,
  type: ProjectVideoType,
  accessToken: string,
  onProgress: (percent: number) => void,
) {
  const response = await fetch('/api/admin/projects/video-upload', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: projectId, type, size: file.size }),
  })
  const target = await response.json()
  if (!response.ok) throw new Error(target.error || 'Could not prepare the video upload.')
  const uploadTarget = target as VideoUploadTarget

  if ('uploaded' in uploadTarget) {
    onProgress(100)
    return
  }

  const { Upload, DetailedError } = await import('tus-js-client')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const storageUrl = supabaseUrl.replace(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/, 'https://$1.storage.supabase.co')
  const endpoint = new URL('/storage/v1/upload/resumable/sign', storageUrl).href

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint,
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'x-signature': uploadTarget.token,
      },
      metadata: {
        bucketName: PROJECT_VIDEO_BUCKET,
        objectName: uploadTarget.path,
        contentType: type,
        cacheControl: PROJECT_MEDIA_CACHE_SECONDS,
      },
      fingerprint: async () => 'portfolio-video-' + uploadTarget.path,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      removeFingerprintOnSuccess: true,
      onProgress: (sent, total) => onProgress(Math.floor(sent / total * 100)),
      onSuccess: () => resolve(),
      onError: (error) => {
        const status = error instanceof DetailedError ? error.originalResponse?.getStatus() : undefined
        if (status === 413) {
          reject(new Error('The storage limit was reached. Export a smaller MP4 or WebM and retry.'))
        } else {
          reject(new Error('Video upload interrupted. Click Add Project to retry.'))
        }
      },
    })

    upload.findPreviousUploads().then(([previous]) => {
      if (previous) upload.resumeFromPreviousUpload(previous)
      upload.start()
    }, () => upload.start())
  })
}

export async function adminAccessToken() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Your session expired. Sign in and try again.')
  return data.session.access_token
}

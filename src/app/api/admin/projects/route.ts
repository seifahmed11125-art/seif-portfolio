import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { AI_VIDEOS_CATEGORY, categories } from '@/data/portfolio'
import { checkAdmin } from '@/lib/adminAuth'
import {
  isProjectId, isProjectVideoType, MAX_PROJECT_COVER_BYTES, MAX_PROJECT_VIDEO_BYTES, parseProjectLink,
  PROJECT_IMAGE_BUCKET, PROJECT_MEDIA_CACHE_SECONDS, PROJECT_VIDEO_BUCKET, projectVideoPath,
} from '@/lib/projectMedia'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const denied = await checkAdmin(req)
    if (denied) return denied

    const form = await req.formData()
    const projectId = form.get('id') ?? randomUUID()
    const title = String(form.get('title') ?? '').trim()
    const description = String(form.get('description') ?? '').trim()
    const category = categories.find((item) => item !== 'All' && item === form.get('category'))
    const externalLink = parseProjectLink(String(form.get('external_link') ?? '').trim())
    const cover = form.get('image')
    const videoType = form.get('video_type')
    const hasCover = cover instanceof File && cover.size > 0

    if (!isProjectId(projectId) || !title || !description || !category || !externalLink) {
      return NextResponse.json({ error: 'Enter a title, description, category, and a valid project link.' }, { status: 400 })
    }
    if (hasCover && (!/^image\/(jpeg|png|webp|avif|gif|svg\+xml)$/i.test(cover.type) || cover.size > MAX_PROJECT_COVER_BYTES)) {
      return NextResponse.json({ error: 'Choose a supported cover image up to 3 MB.' }, { status: 400 })
    }
    if (videoType && (category !== AI_VIDEOS_CATEGORY || !isProjectVideoType(videoType) || !hasCover)) {
      return NextResponse.json({ error: 'A video project needs an MP4 or WebM and a cover image.' }, { status: 400 })
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle()

    if (lookupError) {
      console.error('Could not check for existing project', lookupError.message)
      return NextResponse.json({ error: 'Could not verify the project. Please try again.' }, { status: 503 })
    }
    if (existing) return NextResponse.json({ id: existing.id })

    let videoPath: string | null = null
    if (isProjectVideoType(videoType)) {
      const path = projectVideoPath(projectId, videoType)
      const { data: video } = await supabaseAdmin.storage.from(PROJECT_VIDEO_BUCKET).info(path)
      if (!video?.size || video.size > MAX_PROJECT_VIDEO_BYTES || video.contentType !== videoType) {
        return NextResponse.json({ error: 'The video upload could not be verified. Retry the upload before publishing.' }, { status: 400 })
      }
      videoPath = path
    }

    let imagePath: string | null = null

    if (hasCover) {
      const subtype = cover.type.split('/')[1]
      const extension = subtype === 'svg+xml' ? 'svg' : subtype
      const path = 'projects/' + projectId + '.' + extension
      const bucket = supabaseAdmin.storage.from(PROJECT_IMAGE_BUCKET)
      const { error: uploadError } = await bucket.upload(path, cover, {
        upsert: false,
        cacheControl: PROJECT_MEDIA_CACHE_SECONDS,
      })

      if (uploadError) {
        const { data: existingCover } = await bucket.info(path)
        if (!existingCover || existingCover.size !== cover.size || existingCover.contentType !== cover.type) {
          console.error('Could not save project cover', uploadError.message)
          return NextResponse.json({ error: 'Could not save the cover image. Please try again.' }, { status: 400 })
        }
      }
      imagePath = path
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .upsert({
        id: projectId,
        title,
        external_link: externalLink.href,
        description,
        category,
        image: imagePath,
        ...(videoPath && { video_path: videoPath }),
      }, { onConflict: 'id', ignoreDuplicates: true })
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Could not publish project', error.message)
      return NextResponse.json({ error: 'Could not publish the project. Please try again.' }, { status: 503 })
    }

    return NextResponse.json({ id: data?.id ?? projectId })
  } catch (e) {
    console.error('Could not process project submission', e)
    return NextResponse.json({ error: 'Could not save the project. Please try again.' }, { status: 500 })
  }
}


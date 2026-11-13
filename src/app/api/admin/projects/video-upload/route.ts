import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  isProjectId, isProjectVideoType, MAX_PROJECT_VIDEO_BYTES, MAX_PROJECT_VIDEO_MB,
  PROJECT_VIDEO_BUCKET, projectVideoPath,
} from '@/lib/projectMedia'

export async function POST(request: Request) {
  const denied = await checkAdmin(request)
  if (denied) return denied

  const body = await request.json().catch(() => null)
  const { id, type, size } = body ?? {}
  if (!isProjectId(id) || !isProjectVideoType(type) || !Number.isSafeInteger(size) || size <= 0 || size > MAX_PROJECT_VIDEO_BYTES) {
    return NextResponse.json({ error: 'Choose an MP4 or WebM file up to ' + MAX_PROJECT_VIDEO_MB + ' MB.' }, { status: 400 })
  }

  const path = projectVideoPath(id, type)
  const bucket = supabaseAdmin.storage.from(PROJECT_VIDEO_BUCKET)
  const { data: existing } = await bucket.info(path)
  if (existing) {
    if (existing.size === size && existing.contentType === type) {
      return NextResponse.json({ uploaded: true })
    }
    return NextResponse.json({ error: 'Choose the video again to replace the previous upload.' }, { status: 409 })
  }

  const { data, error } = await bucket.createSignedUploadUrl(path)
  if (error) {
    console.error('Could not prepare project video upload', error.message)
    return NextResponse.json({ error: 'Could not prepare the video upload. Please try again.' }, { status: 503 })
  }

  return NextResponse.json({ path, token: data.token }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

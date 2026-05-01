import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const form = await req.formData()

    const title = String(form.get('title') ?? '')
    const description = String(form.get('description') ?? '')
    const category = String(form.get('category') ?? '')
    const file = form.get('image')

    let imagePath: string | null = null

    if (file instanceof File && file.size > 0) {
      const ext = file.name.split('.').pop() || 'png'
      const fileName = `${Date.now()}.${ext}`
      const filePath = `projects/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('images')
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 })
      }

      imagePath = filePath
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          title: title || null,
          description: description || null,
          category: category || null,
          image: imagePath,
        },
      ])
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ id: data.id })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


import 'server-only'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function checkAdmin(request: Request) {
  const token = /^Bearer (\S+)$/i.exec(request.headers.get('authorization') ?? '')?.[1]

  if (token) {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (!error && data.user?.app_metadata.portfolio_admin === true) return null
    if (!error && data.user) {
      return NextResponse.json({ error: 'This account cannot publish portfolio projects.' }, { status: 403 })
    }
  }

  return NextResponse.json({ error: 'Sign in to the admin panel and try again.' }, { status: 401 })
}

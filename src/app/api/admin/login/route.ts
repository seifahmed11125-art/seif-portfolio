import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

async function getAdminEmail(username: string) {
  const perPage = 100
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const admin = data.users.find((user) => user.email && user.email_confirmed_at
      && user.app_metadata.portfolio_admin === true
      && user.app_metadata.portfolio_username === username)
    if (admin?.email) return admin.email
    if (data.users.length < perPage) return null
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const password: unknown = body?.password
  const username: unknown = body?.username
  if (typeof password !== 'string' || !password || password.length > 1024) {
    return NextResponse.json({ error: 'Enter your password.' }, { status: 400 })
  }
  if (username !== 'admin') {
    return NextResponse.json({ error: 'Check your username and password.' }, { status: 401 })
  }

  try {
    const email = await getAdminEmail(username)
    if (!email) return NextResponse.json({ error: 'Admin sign-in is unavailable.' }, { status: 503 })

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    )
    const { data, error } = await authClient.auth.signInWithPassword({ email, password })
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Too many sign-in attempts. Try again later.' }, { status: 429 })
    }
    if (error || !data.session || data.user?.app_metadata.portfolio_admin !== true
      || data.user.app_metadata.portfolio_username !== username) {
      return NextResponse.json({ error: 'Check your username and password.' }, { status: 401 })
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Admin sign-in is unavailable. Try again shortly.' }, { status: 503 })
  }
}

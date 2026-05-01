import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Project } from '@/data/portfolio'

type DbProject = {
  id: string
  title: string | null
  description: string | null
  image: string | null
  category: string | null
  created_at: string | null
}

function toProjectsBucketPath(image: string) {
  // Accept:
  // - full public URL
  // - "images/projects/foo.png"
  // - "projects/foo.png"
  // - "foo.png"
  if (/^https?:\/\//i.test(image)) return image
  if (image.startsWith('images/projects/')) return image
  if (image.startsWith('projects/')) return `images/${image}`
  return `images/projects/${image.replace(/^\/+/, '')}`
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setLoading(true)
        setError(null)

        const { data: projectRows, error: dbError } = await supabase
          .from('projects')
          .select('id,title,description,image,category,created_at')
          .order('created_at', { ascending: false })

        if (dbError) throw dbError

        const normalizedProjects = (projectRows ?? []).map((p: any) => {
          const row = p as DbProject
          return {
            id: row.id,
            title: row.title,
            category: row.category,
            description: row.description ?? null,
            image: row.image ? toProjectsBucketPath(row.image) : null,
            created_at: row.created_at ?? null,
          } satisfies Project
        })

        if (!cancelled) {
          setProjects(normalizedProjects)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load projects'
        if (!cancelled) setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return {
    projects,
    loading,
    error,
  }
}


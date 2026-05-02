export function toPublicSettingsImageUrl(rootPath: string) {
  // Converts "/foo.png" → public URL for "images/settings/foo.png"
  const fileName = rootPath.replace(/^\/+/, '')
  return `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}${fileName}`
}


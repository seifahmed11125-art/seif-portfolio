import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://opsghfboskrgmhozpvga.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc2doZmJvc2tyZ21ob3pwdmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzcxODYsImV4cCI6MjA5MzIxMzE4Nn0.Y_nvyqaYi6Kxdc-ejlO0UTNP1xS4MZH9IrIzX3GMY40'

export const supabase = createClient(supabaseUrl, supabaseKey)

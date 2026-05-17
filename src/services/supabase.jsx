import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL موجود؟', !!supabaseUrl)  // للتأكد - سيظهر true
console.log('Key موجود؟', !!supabaseAnonKey)  // للتأكد - سيظهر true

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
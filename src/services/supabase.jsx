const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// تأكد من وجودهما (للتجربة المحلية)
if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ متغيرات البيئة مفقودة! تأكد من ملف .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
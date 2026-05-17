import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://secbbhphotizmefoxogk.supabase.co'

const supabaseKey = 'sb_publishable_yLL41XBh_Q0ZYvQeU0Ag0g_Uoofu4WX'

export const supabase = createClient(supabaseUrl, supabaseKey)
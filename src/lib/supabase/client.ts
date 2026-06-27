import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

export function createSupabaseBrowserClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseAnonKey())
}

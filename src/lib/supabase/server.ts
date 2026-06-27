import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabase/env'

export function createSupabaseServiceClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

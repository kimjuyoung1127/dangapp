import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublicEnv } from '@/lib/supabase/config'

export function createClient() {
    const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv()

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}

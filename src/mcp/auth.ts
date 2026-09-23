import { createClient } from '@supabase/supabase-js'
import { sha256Hex } from '@/lib/mcp-key'

export function getMcpSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface VerifiedApiKey {
  userId: string
  apiKeyId: string
}

export async function verifyApiKey(rawKey: string): Promise<VerifiedApiKey | null> {
  const keyHash = await sha256Hex(rawKey)
  const supabase = getMcpSupabaseClient()

  const { data } = await supabase
    .from('mcp_api_keys')
    .select('id, user_id, revoked_at')
    .eq('key_hash', keyHash)
    .single()

  if (!data || data.revoked_at) return null

  await supabase
    .from('mcp_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return { userId: data.user_id, apiKeyId: data.id }
}

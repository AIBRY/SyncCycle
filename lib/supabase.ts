import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Specialized Supabase client for Next.js.
 * This handles cookie-based auth so the Middleware and Browser stay in sync.
 */
export const supabase = createClientComponentClient();
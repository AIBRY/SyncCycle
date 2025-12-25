import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase'; // Adjust this path if your types are elsewhere

/**
 * This is the specialized Supabase client for Next.js Client Components.
 * * It automatically handles:
 * 1. Reading/Writing cookies for Auth session persistence.
 * 2. Syncing the session so Middleware can protect routes.
 * 3. Token refresh logic in the browser.
 */
export const supabase = createClientComponentClient<Database>();
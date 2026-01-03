// lib/supabase.js
import { createClient } from '@supabase/supabase-js'; // 이 부분이 수정됨

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
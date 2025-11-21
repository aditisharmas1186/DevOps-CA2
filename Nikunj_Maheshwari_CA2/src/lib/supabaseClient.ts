import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://qzutdqrlfijhslnbqosw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yUesQxZOj-Ja99G70mSqRA_kY6wAxgF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

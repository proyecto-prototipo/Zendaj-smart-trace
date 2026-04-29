import { createClient } from '@supabase/supabase-js';

// Estos valores los obtienes en tu panel de Supabase: Project Settings > API
const supabaseUrl = 'https://jispvhxshtbjikttqeol.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_RAA7IpTOg5mMSaPCPE99CA_zgxvMUmx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
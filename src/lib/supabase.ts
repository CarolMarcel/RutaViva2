import { createClient } from '@supabase/supabase-js';

// ⚙️ Variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 🚀 Cliente oficial de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

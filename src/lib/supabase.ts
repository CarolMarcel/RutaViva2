// src/lib/supabase.ts
// Simulación de Supabase para entorno local sin .env

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: (_event: any, _callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    eq: () => ({ data: null, error: null }),
    maybeSingle: () => ({ data: null, error: null }),
  }),
};

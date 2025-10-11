// src/lib/supabase.ts
// Mock ligero que simula la API que tu AuthContext usa.
// IMPORTANTE: este mock es para desarrollo local; cuando conectes a Supabase real,
// reemplaza por el cliente real.

import { mockDb } from "./mockDb";

type UserLike = { id: string; email: string | null };

type Session = { user: UserLike } | null;

type OnAuthCallback = (event: string, session: { user: UserLike } | null) => void;

let currentSession: { user: UserLike } | null = null;
const listeners: OnAuthCallback[] = [];

// utils
function notifyAll(event: string, session: { user: UserLike } | null) {
  for (const l of listeners) {
    try {
      l(event, session);
    } catch (e) {
      // ignore
    }
  }
}

mockDb.seedIfEmpty();

export const supabase = {
  // auth namespace
  auth: {
    // getSession: devuelve el "session" actual
    async getSession(): Promise<{ data: { session: { user: UserLike } | null }; error: null | Error }> {
      return { data: { session: currentSession }, error: null };
    },

    // onAuthStateChange: permite suscribirse a cambios; devuelve objeto con data.subscription.unsubscribe()
    onAuthStateChange(callback: OnAuthCallback) {
      listeners.push(callback);
      // devolver objeto similar al real:
      const subscription = {
        unsubscribe: () => {
          const idx = listeners.indexOf(callback);
          if (idx >= 0) listeners.splice(idx, 1);
        },
      };
      // inmediatamente invocamos callback con sesión actual (emular)
      setTimeout(() => callback("INITIAL", currentSession), 0);
      return { data: { subscription } };
    },

    // signInWithPassword: en este mock no validamos contraseñas reales; solo buscamos/creamos usuario
    async signInWithPassword({ email, password }: { email: string; password: string; }) {
      // simple validación
      if (!email) {
        return { data: null, error: new Error("Email required") };
      }

      // buscar usuario
      let user = mockDb.findUserByEmail(email);
      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      // establecer sesión
      currentSession = { user: { id: user.id, email: user.email } };
      notifyAll("SIGNED_IN", currentSession);
      return { data: { user: currentSession.user }, error: null };
    },

    // signUp: crea usuario y profile
    async signUp({ email, password }: { email: string; password: string }) {
      if (!email) {
        return { data: null, error: new Error("Email required") };
      }
      // si existe, retornamos error o login (aquí devolveremos error para simular comportamiento)
      let existing = mockDb.findUserByEmail(email);
      if (existing) {
        return { data: null, error: new Error("User already exists") };
      }
      const user = mockDb.createUser(email);
      const profile = mockDb.createProfileForUser(user.id, user.email);
      currentSession = { user: { id: user.id, email: user.email } };
      notifyAll("SIGNED_UP", currentSession);
      return { data: { user: currentSession.user }, error: null };
    },

    async signOut() {
      currentSession = null;
      notifyAll("SIGNED_OUT", null);
      return { error: null };
    },
  },

  // .from(table).select(...).eq(...).single() simulation for 'profiles'
  from(tableName: string) {
    if (tableName !== "profiles") {
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error("table not mocked") }) }) }),
      };
    }

    return {
      select: (_cols = "*") => {
        return {
          eq: (col: string, value: string) => {
            return {
              single: async () => {
                if (col !== "id") {
                  return { data: null, error: new Error("only eq('id', ...) is implemented in mock") };
                }
                const profile = mockDb.findProfileById(value);
                if (!profile) {
                  return { data: null, error: new Error("No profile") };
                }
                return { data: profile, error: null };
              },
            };
          },
        };
      },
    };
  },
};

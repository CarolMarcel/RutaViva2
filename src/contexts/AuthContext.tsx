import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

// Tipo del perfil almacenado en la tabla "profiles"
interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  [key: string]: unknown;
}

// Tipo del contexto de autenticación
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Verificar sesión inicial y escuchar cambios
  useEffect(() => {
   const getSession = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const currentUser = data.session?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      console.log("✅ Usuario autenticado:", currentUser);
      await loadUserProfile(currentUser.id);
    } else {
      console.warn("⚠️ No hay usuario autenticado");
    }
  } catch (err) {
    console.error("Error al obtener la sesión:", err);
  } finally {
    console.log("🟢 Terminó getSession, cambiando loading a false");
    setLoading(false);
  }
};

    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await loadUserProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Cargar perfil del usuario
  const loadUserProfile = async (userId: string): Promise<void> => {
  console.log("🟡 Buscando perfil para el usuario:", userId);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.warn("❌ No se encontró perfil:", error.message);
    setProfile(null);
  } else {
    console.log("📄 Perfil cargado:", data);
    setProfile(data as Profile);
  }

  // ✅ Asegurar que se apague el loading incluso si hay error
  setLoading(false);
};


  // Login
  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) await loadUserProfile(data.user.id);
  };

  // Registro
  const signUp = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) await loadUserProfile(data.user.id);
  };

  // Logout
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Evitar renderizado mientras se carga
  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#555",
          fontSize: "1.1rem",
        }}
      >
        Cargando configuración de usuario...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro del AuthProvider");
  return context;
};


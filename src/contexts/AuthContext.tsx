import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

// 🔹 Tipo del perfil almacenado en la tabla "profiles"
interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  [key: string]: unknown; // reemplaza "any" por "unknown" (recomendado por ESLint)
}

// 🔹 Tipo del contexto de autenticación
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 🔹 Crear el contexto con tipo seguro
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Cargar sesión y perfil al iniciar
  useEffect(() => {
    const getSession = async (): Promise<void> => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log("✅ Usuario autenticado:", currentUser);
        await loadUserProfile(currentUser.id);
      }
      setLoading(false);
    };

    getSession();

    // 🔸 Escucha cambios en la sesión
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

  // 🔹 Cargar perfil desde la tabla "profiles"
  const loadUserProfile = async (userId: string): Promise<void> => {
    console.log("🟡 Buscando perfil para el usuario:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("📄 Perfil cargado:", data, "❌ Error:", error);

    if (error || !data) {
      setProfile(null);
    } else {
      setProfile(data as Profile);
    }
  };

  // 🔹 Login
  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) await loadUserProfile(data.user.id);
  };

  // 🔹 Registro
  const signUp = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) await loadUserProfile(data.user.id);
  };

  // 🔹 Logout
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook para usar el contexto de forma segura
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro del AuthProvider");
  return context;
};


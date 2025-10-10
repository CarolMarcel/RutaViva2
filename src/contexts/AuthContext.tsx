import { createContext, useContext, useState, useEffect } from "react";

// Tipos básicos
interface User {
  id: string;
  email: string;
  role: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulación de carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    console.log("Mock signUp ejecutado:", email);
    return Promise.resolve({ error: null });
  };

  const signIn = async (email: string, password: string) => {
    console.log("Mock signIn ejecutado:", email);
    setUser({ id: "1", email, role: "client" });
    setProfile({ id: "1", full_name: "Usuario Demo", role: "client" });
    return Promise.resolve({ error: null });
  };

  const signOut = async () => {
    console.log("Mock signOut ejecutado");
    setUser(null);
    setProfile(null);
    return Promise.resolve();
  };

  const resetPassword = async (email: string) => {
    console.log("Mock resetPassword ejecutado:", email);
    return Promise.resolve({ error: null });
  };

  const value = { user, profile, loading, signUp, signIn, signOut, resetPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

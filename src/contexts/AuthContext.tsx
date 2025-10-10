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

    // Simulación: revisa si el correo ya existe
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = existingUsers.some((u: any) => u.email === email);

    if (userExists) {
      return Promise.resolve({ error: new Error("Ya existe una cuenta con este correo electrónico.") });
    }

    // Crea un nuevo usuario simulado
    const newUser = {
      id: Date.now().toString(),
      email,
      full_name: fullName,
      phone,
      role: "client",
    };

    // Guarda el usuario en localStorage (simulación de base de datos)
    localStorage.setItem("users", JSON.stringify([...existingUsers, newUser]));

    // Retorna éxito
    return Promise.resolve({ error: null });
  };

  const signIn = async (email: string, password: string) => {
    console.log("Mock signIn ejecutado:", email);

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u: any) => u.email === email);

    if (!found) {
      return Promise.resolve({ error: new Error("No existe una cuenta con este correo.") });
    }

    setUser({ id: found.id, email: found.email, role: "client" });
    setProfile({ id: found.id, full_name: found.full_name, role: "client" });

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

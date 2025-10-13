import { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  phone?: string;
  role: "client" | "admin" | "collaborator";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar usuario guardado en localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("rutaviva_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 🔹 Iniciar sesión
  const signIn = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");

    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (!foundUser) {
      return { error: "Credenciales incorrectas" };
    }

    // ✅ Evita guardar la contraseña en el estado del usuario activo
    const safeUser: User = {
      name: foundUser.name,
      email: foundUser.email,
      phone: foundUser.phone,
      role: foundUser.role,
    };

    localStorage.setItem("rutaviva_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return {};
  };

  // 🔹 Registrar usuario nuevo
  const signUp = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const users = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");

    const emailExists = users.some((u: any) => u.email === email);
    if (emailExists) {
      return { error: "El correo ya está registrado" };
    }

    const newUser = {
      name,
      email,
      phone,
      role: "client",
      password, // Solo se guarda aquí, no se expone en sesión
    };

    users.push(newUser);
    localStorage.setItem("rutaviva_users", JSON.stringify(users));

    const safeUser: User = {
      name,
      email,
      phone,
      role: "client",
    };

    localStorage.setItem("rutaviva_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return {};
  };

  // 🔹 Cerrar sesión
  const signOut = () => {
    localStorage.removeItem("rutaviva_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};


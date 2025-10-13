import { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  phone?: string;
  role: "client" | "admin" | "collaborator";
  password?: string; // 🔹 opcional para mantener compatibilidad local
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar usuario guardado en localStorage al iniciar la app
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("rutaviva_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email && parsed.name) {
          setUser(parsed);
        } else {
          localStorage.removeItem("rutaviva_user");
        }
      }
    } catch {
      localStorage.removeItem("rutaviva_user");
    }
    setLoading(false);
  }, []);

  // 🔹 Iniciar sesión
  const signIn = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");

    const foundUser = users.find(
      (u: User & { password: string }) =>
        u.email === email && u.password === password
    );

    if (!foundUser) {
      return { error: "Credenciales incorrectas" };
    }

    // 🔹 Guardar usuario activo
    localStorage.setItem(
      "rutaviva_user",
      JSON.stringify({
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role,
      })
    );

    setUser(foundUser);
    return {};
  };

  // 🔹 Registrarse
  const signUp = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const users = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");

    const emailExists = users.some((u: User & { password: string }) => u.email === email);
    if (emailExists) {
      return { error: "El correo ya está registrado" };
    }

    const newUser: User & { password: string } = {
      name,
      email,
      phone,
      role: "client",
      password,
    };

    // 🔹 Guardar nuevo usuario y establecerlo como logueado
    users.push(newUser);
    localStorage.setItem("rutaviva_users", JSON.stringify(users));
    localStorage.setItem(
      "rutaviva_user",
      JSON.stringify({
        name,
        email,
        phone,
        role: "client",
      })
    );

    setUser(newUser);
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

// 🔹 Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};


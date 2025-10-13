import { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  phone?: string;
  role: "client" | "admin" | "collaborator";
  password?: string;
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

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("rutaviva_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem("rutaviva_user");
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");
    const foundUser = users.find(
      (u: User & { password: string }) =>
        u.email === email && u.password === password
    );

    if (!foundUser) return { error: "Credenciales incorrectas" };

    // Guarda solo los datos necesarios
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

  const signUp = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const users = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");
    const emailExists = users.some(
      (u: User & { password: string }) => u.email === email
    );
    if (emailExists) return { error: "El correo ya está registrado" };

    const newUser: User & { password: string } = {
      name,
      email,
      phone,
      role: "client",
      password,
    };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};


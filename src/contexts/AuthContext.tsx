import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, addUser, findUser, loginUser } from '../lib/localDB';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('rv_current_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (findUser(email)) throw new Error('Ya existe una cuenta con este correo.');
    const newUser: User = {
      id: uuidv4(),
      email,
      password,
      fullName,
      phone,
      role: 'client',
    };
    addUser(newUser);
    localStorage.setItem('rv_current_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const found = loginUser(email, password);
    if (!found) throw new Error('Correo o contraseña incorrectos.');
    localStorage.setItem('rv_current_user', JSON.stringify(found));
    setUser(found);
  };

  const signOut = () => {
    localStorage.removeItem('rv_current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



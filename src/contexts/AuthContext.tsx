import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name?: string;
  role?: string; // 'admin' | 'client' | 'collaborator'
  email?: string;
}

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar sesión actual + perfil
  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadUserProfile(currentUser.id);
      }

      setLoading(false);
    };

    getSessionAndProfile();

    // 🔹 Escucha cambios en el estado de autenticación
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }, []);

  // 🔹 Función auxiliar para obtener el perfil desde la tabla profiles
  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('⚠️ Error al cargar el perfil:', error.message);
      setProfile(null);
      return;
    }

    console.log('✅ Perfil cargado:', data);
    setProfile(data);
  };

  // 🔹 LOGIN real
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Error al iniciar sesión:', error.message);
      return { data: null, error };
    }

    setUser(data.user);
    await loadUserProfile(data.user.id);
    return { data, error };
  };

  // 🔹 REGISTRO real (y creación de perfil en la tabla profiles)
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Error al registrar:', error.message);
      return { data: null, error };
    }

    if (data.user) {
      // Crea un registro en la tabla profiles con rol "client" por defecto
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          email: email,
          full_name: 'Nuevo usuario',
          role: 'client',
        },
      ]);

      if (profileError) console.error('⚠️ Error creando perfil:', profileError.message);

      await loadUserProfile(data.user.id);
    }

    setUser(data.user);
    return { data, error };
  };

  // 🔹 LOGOUT
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, signIn, signUp, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};




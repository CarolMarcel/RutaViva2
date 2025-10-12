import { useState } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

function AuthFlow() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      {mode === 'login' ? (
        <Login onToggleMode={() => setMode('register')} />
      ) : (
        <Register onToggleMode={() => setMode('login')} />
      )}
    </div>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold mb-2 text-blue-700">¡Bienvenido a RutaViva!</h1>
      <p className="text-gray-600 mb-4">{user?.fullName}</p>
      <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Cerrar sesión
      </button>
    </div>
  );
}

function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <AuthFlow />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}


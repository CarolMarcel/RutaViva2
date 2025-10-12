import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Login({ onToggleMode }: { onToggleMode: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Inicia sesión en RutaViva</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700">
          Iniciar sesión
        </button>
      </form>
      <p className="text-center mt-4">
        ¿No tienes cuenta?{' '}
        <button onClick={onToggleMode} className="text-blue-600 font-semibold hover:underline">
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}



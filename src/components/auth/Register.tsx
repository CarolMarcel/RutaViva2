import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Register({ onToggleMode }: { onToggleMode: () => void }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await signUp(email, password, fullName, phone);
      setMessage('✅ Cuenta creada con éxito. Ahora puedes iniciar sesión.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Crea tu cuenta RutaViva</h2>
      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-3">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded" required />
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded" required />
        <input type="tel" placeholder="Teléfono (+56 9...)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded" required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded" required />
        <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded" required />
        <button className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700">
          Crear cuenta
        </button>
      </form>
      <p className="text-center mt-4">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onToggleMode} className="text-blue-600 font-semibold hover:underline">
          Inicia sesión
        </button>
      </p>
    </div>
  );
}



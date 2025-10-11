import { useState } from 'react';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword, sanitizeInput } from '../../lib/validation';
import { encryptData } from '../../lib/encryption';

interface RegisterProps {
  onToggleMode: () => void;
}

export function Register({ onToggleMode }: RegisterProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 🧹 Sanitizar y validar campos
    const sanitizedName = sanitizeInput(formData.fullName);
    if (!sanitizedName || sanitizedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    // Validación formato chileno: +56 9 XXXX XXXX
    const phoneRegex = /^\+56\s?9\s?\d{4}\s?\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Por favor ingresa un número válido: +56 9 XXXX XXXX');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const encryptedPhone = encryptData(formData.phone);

      // ✅ Crear cuenta real en Supabase
      const { data, error: signUpError } = await signUp(formData.email, formData.password);

      if (signUpError) {
        console.error('Error al crear usuario:', signUpError);
        if (signUpError.message?.includes('duplicate')) {
          setError('Ya existe una cuenta registrada con este correo electrónico.');
        } else {
          setError('Error al crear la cuenta. Por favor intenta de nuevo.');
        }
      } else {
        // 🔐 Opcional: guarda los datos extra en tu tabla "profiles"
        // await supabase.from('profiles').insert([
        //   { id: data.user.id, full_name: sanitizedName, phone: encryptedPhone }
        // ]);

        setMessage('✅ Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="text-gray-600 mt-2">Únete a RutaViva hoy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Juan Pérez"
              required
            />
          </div>
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+56 9 1234 5678"
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 8 caracteres, una mayúscula, una minúscula y un número
          </p>
        </div>

        {/* Confirmar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onToggleMode}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}


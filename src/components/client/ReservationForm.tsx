import { useState } from 'react';
import { X, Calendar, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { validateDate, validateNumber } from '../../lib/validation';
import { encryptData } from '../../lib/encryption';
import type { Database } from '../../lib/database.types';

type Destination = Database['public']['Tables']['destinations']['Row'];

interface ReservationFormProps {
  destination: Destination;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReservationForm({ destination, onClose, onSuccess }: ReservationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    numberOfPeople: 1,
    specialRequests: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Soporte para nombre correcto del campo (price o price_per_person)
  const pricePerPerson = destination.price_per_person || destination.price || 0;

  // ✅ Total calculado dinámicamente
  const totalAmount = pricePerPerson * formData.numberOfPeople;

  // ✅ Formato en pesos chilenos (CLP)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateDate(formData.date)) {
      setError('La fecha debe ser hoy o posterior.');
      return;
    }

    if (!validateNumber(formData.numberOfPeople, 1, destination.max_people || 1)) {
      setError(
        `El número de personas debe estar entre 1 y ${destination.max_people || 1}`
      );
      return;
    }

    setLoading(true);

    try {
      const encryptedRequests = formData.specialRequests
        ? encryptData(formData.specialRequests)
        : null;

      const { error: insertError } = await supabase.from('reservations').insert({
        client_id: user?.id,
        destination_id: destination.id,
        reservation_date: formData.date,
        number_of_people: formData.numberOfPeople,
        total_amount: totalAmount,
        special_requests: encryptedRequests,
        status: 'pending',
        payment_status: 'pending',
      });

      if (insertError) throw insertError;

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'RESERVATION_CREATED',
        table_name: 'reservations',
        new_data: {
          destination_id: destination.id,
          reservation_date: formData.date,
          number_of_people: formData.numberOfPeople,
          total_amount: totalAmount,
        },
      });

      onSuccess();
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError('Error al crear la reserva. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ENCABEZADO */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Realizar Reserva</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CUERPO */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{destination.location}</p>
            <p className="text-sm text-gray-700">{destination.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* FECHA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de la Reserva
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={getTomorrowDate()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* NÚMERO DE PERSONAS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Personas (Máx. {destination.max_people || 1})
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.numberOfPeople}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfPeople: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max={destination.max_people || 1}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* SOLICITUDES ESPECIALES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitudes Especiales (Opcional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialRequests: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Menciona cualquier requerimiento especial..."
                />
              </div>
            </div>

            {/* TOTAL */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio por persona:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(pricePerPerson)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Número de personas:</span>
                <span className="font-medium text-gray-900">
                  {formData.numberOfPeople}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


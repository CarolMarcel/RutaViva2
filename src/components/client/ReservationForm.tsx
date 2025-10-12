import { useState } from 'react';
import { Calendar, Users, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { addReservation } from '../../lib/localDB';
import { v4 as uuidv4 } from 'uuid';

interface ReservationFormProps {
  destination: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReservationForm({ destination, onClose, onSuccess }: ReservationFormProps) {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState('');

  const pricePerPerson = destination.price_per_person || destination.price || 0;
  const totalAmount = pricePerPerson * numberOfPeople;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Por favor selecciona una fecha.');
      return;
    }

    const newReservation = {
      id: uuidv4(),
      clientId: user?.id,
      destinationId: destination.id,
      date,
      numberOfPeople,
      totalAmount,
      status: 'pending',
    };

    addReservation(newReservation);
    onSuccess();
    alert('✅ ¡Reserva creada exitosamente!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Reserva en {destination.name}
        </h2>
        <p className="text-gray-600 mb-4">{destination.location}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de la Reserva
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Personas
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                min={1}
                className="w-full border pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitudes Especiales
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full border pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Escribe tus peticiones aquí..."
              />
            </div>
          </div>

          <div className="flex justify-between border-t pt-3 text-gray-800">
            <span>Total:</span>
            <span className="font-bold text-green-600">{formatCurrency(totalAmount)}</span>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Confirmar Reserva
          </button>
        </form>
      </div>
    </div>
  );
}



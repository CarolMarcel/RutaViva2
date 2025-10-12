import { getReservations } from '../../lib/localDB';
import { useAuth } from '../../contexts/AuthContext';
import { mockDestinations } from '../../lib/mockDb';

export function MyReservations() {
  const { user } = useAuth();
  const reservations = getReservations().filter((r) => r.clientId === user?.id);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  if (reservations.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600">
        No tienes reservas aún. ¡Haz la primera desde los destinos!
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {reservations.map((res) => {
        const destination = mockDestinations.find((d) => d.id === res.destinationId);
        return (
          <div
            key={res.id}
            className="bg-white shadow-md p-4 rounded-xl border border-gray-200"
          >
            <h3 className="text-lg font-bold text-blue-600">
              {destination?.name || 'Destino'}
            </h3>
            <p className="text-sm text-gray-600">{destination?.location}</p>
            <p className="mt-2 text-sm text-gray-700">
              Fecha: <span className="font-semibold">{res.date}</span>
            </p>
            <p className="text-sm text-gray-700">
              Personas: <span className="font-semibold">{res.numberOfPeople}</span>
            </p>
            <p className="text-sm text-gray-700">
              Total: <span className="font-semibold text-green-600">{formatCurrency(res.totalAmount)}</span>
            </p>
            <p className="mt-1 text-sm text-gray-500 italic">
              Estado: {res.status === 'pending' ? 'Pendiente de confirmación' : res.status}
            </p>
          </div>
        );
      })}
    </div>
  );
}



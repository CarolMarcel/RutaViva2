import { useState } from 'react';
import { DestinationCard } from './DestinationCard';
import { ReservationForm } from './ReservationForm';
import { MyReservations } from './MyReservations';
import { mockDestinations } from '../../lib/mockDb';
import { useAuth } from '../../contexts/AuthContext';

export function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [showReservations, setShowReservations] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">RutaViva - Bienvenido {user?.fullName}</h1>
        <div className="space-x-3">
          <button
            onClick={() => setShowReservations(!showReservations)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {showReservations ? 'Ver Destinos' : 'Mis Reservas'}
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="p-6">
        {!showReservations ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Explora nuestros destinos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDestinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  onReserve={() => setSelectedDestination(dest)}
                />
              ))}
            </div>
          </>
        ) : (
          <MyReservations />
        )}
      </main>

      {selectedDestination && (
        <ReservationForm
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onSuccess={() => setSelectedDestination(null)}
        />
      )}
    </div>
  );
}

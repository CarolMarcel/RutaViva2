import { useState, useEffect } from 'react';
import { LogOut, Calendar, MapPin, DollarSign, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { DestinationCard } from './DestinationCard';
import { ReservationForm } from './ReservationForm';
import { MyReservations } from './MyReservations';
import type { Database } from '../../lib/database.types';

type Destination = Database['public']['Tables']['destinations']['Row'];

export function ClientDashboard() {
  const { profile, signOut } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'reservations'>('explore');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  RutaViva
                </h1>
                <p className="text-xs text-gray-500">Panel del Cliente</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'explore'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Explorar Destinos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'reservations'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Mis Reservas</span>
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'explore' ? (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando destinos...</p>
              </div>
            ) : destinations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hay destinos disponibles en este momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    onReserve={() => setSelectedDestination(destination)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <MyReservations />
        )}
      </div>

      {selectedDestination && (
        <ReservationForm
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onSuccess={() => {
            setSelectedDestination(null);
            setActiveTab('reservations');
          }}
        />
      )}
    </div>
  );
}

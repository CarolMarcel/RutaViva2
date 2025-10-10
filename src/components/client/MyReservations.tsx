import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { decryptData } from '../../lib/encryption';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  destinations: Database['public']['Tables']['destinations']['Row'];
};

export function MyReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, destinations(*)')
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user!.id,
        action: 'RESERVATION_CANCELLED',
        table_name: 'reservations',
        record_id: reservationId,
      });

      loadReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Error al cancelar la reserva');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      pending: 'Pago Pendiente',
      paid: 'Pagado',
      refunded: 'Reembolsado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando reservas...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No tienes reservas aún</p>
        <p className="text-sm text-gray-500 mt-2">Explora nuestros destinos y haz tu primera reserva</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={reservation.destinations.image_url || 'https://images.pexels.com/photos/2265876/pexels-photo-2265876.jpeg'}
                alt={reservation.destinations.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {reservation.destinations.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{reservation.destinations.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(reservation.status)}
                  {getPaymentStatusBadge(reservation.payment_status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="text-sm font-medium">{formatDate(reservation.reservation_date)}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Personas</p>
                    <p className="text-sm font-medium">{reservation.number_of_people}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-medium">{formatCurrency(reservation.total_amount)}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 mr-2 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Creada</p>
                    <p className="text-sm font-medium">
                      {new Date(reservation.created_at).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>

              {reservation.special_requests && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Solicitudes Especiales:</p>
                  <p className="text-sm text-gray-700">
                    {decryptData(reservation.special_requests)}
                  </p>
                </div>
              )}

              {reservation.status === 'pending' && (
                <button
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar Reserva</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

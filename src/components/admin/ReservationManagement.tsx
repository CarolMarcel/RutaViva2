import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { decryptData } from '../../lib/encryption';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  destinations: Database['public']['Tables']['destinations']['Row'];
};

export function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, profiles(*), destinations(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (
    reservationId: string,
    status: 'confirmed' | 'cancelled' | 'completed'
  ) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId);

      if (error) throw error;
      loadReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const updatePaymentStatus = async (
    reservationId: string,
    paymentStatus: 'paid' | 'refunded'
  ) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ payment_status: paymentStatus })
        .eq('id', reservationId);

      if (error) throw error;
      loadReservations();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error al actualizar el estado de pago');
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.destinations.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      month: 'short',
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
            <option value="completed">Completada</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Cliente</p>
                <p className="text-sm font-medium text-gray-900">{reservation.profiles.full_name}</p>
                <p className="text-xs text-gray-600">{reservation.profiles.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Destino</p>
                <p className="text-sm font-medium text-gray-900">{reservation.destinations.name}</p>
                <p className="text-xs text-gray-600">{reservation.destinations.location}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha y Personas</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(reservation.reservation_date)}
                </p>
                <p className="text-xs text-gray-600">{reservation.number_of_people} personas</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-sm font-bold text-green-600">
                  {formatCurrency(reservation.total_amount)}
                </p>
              </div>
            </div>

            {reservation.special_requests && (
              <div className="mt-4 bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Solicitudes Especiales:</p>
                <p className="text-sm text-gray-700">
                  {decryptData(reservation.special_requests)}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                {getStatusBadge(reservation.status)}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    reservation.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : reservation.payment_status === 'refunded'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {reservation.payment_status === 'paid'
                    ? 'Pagado'
                    : reservation.payment_status === 'refunded'
                    ? 'Reembolsado'
                    : 'Pago Pendiente'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar</span>
                    </button>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </>
                )}

                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'completed')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Completar</span>
                  </button>
                )}

                {reservation.payment_status === 'pending' && reservation.status !== 'cancelled' && (
                  <button
                    onClick={() => updatePaymentStatus(reservation.id, 'paid')}
                    className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 text-sm"
                  >
                    Marcar como Pagado
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron reservas</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { LogOut, Calendar, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { decryptData } from '../../lib/encryption';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  destinations: Database['public']['Tables']['destinations']['Row'];
};

export function CollaboratorDashboard() {
  const { profile, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, profiles(*), destinations(*)')
        .order('reservation_date', { ascending: true });

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

      await supabase.from('audit_logs').insert({
        action: 'RESERVATION_UPDATED',
        table_name: 'reservations',
        record_id: reservationId,
        new_data: { status },
      });

      loadReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const updatePaymentStatus = async (reservationId: string, paymentStatus: 'paid') => {
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

  const filteredReservations = reservations.filter((reservation) =>
    statusFilter === 'all' ? true : reservation.status === statusFilter
  );

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

  const stats = {
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  RutaViva
                </h1>
                <p className="text-xs text-gray-500">Panel del Colaborador</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Confirmadas</p>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Completadas</p>
            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {reservation.destinations.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{reservation.destinations.location}</span>
                    </div>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cliente</p>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.profiles.full_name}
                    </p>
                    <p className="text-xs text-gray-600">{reservation.profiles.email}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fecha</p>
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
                    <p className="text-xs text-gray-600">
                      {reservation.payment_status === 'paid' ? 'Pagado' : 'Pendiente de pago'}
                    </p>
                  </div>
                </div>

                {reservation.special_requests && (
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Solicitudes Especiales:</p>
                    <p className="text-sm text-gray-700">
                      {decryptData(reservation.special_requests)}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirmar</span>
                      </button>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  )}

                  {reservation.status === 'confirmed' && (
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'completed')}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Marcar como Completada</span>
                    </button>
                  )}

                  {reservation.payment_status === 'pending' &&
                    reservation.status !== 'cancelled' && (
                      <button
                        onClick={() => updatePaymentStatus(reservation.id, 'paid')}
                        className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 text-sm font-medium"
                      >
                        Marcar como Pagado
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No hay reservas para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

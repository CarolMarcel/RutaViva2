import { useState, useEffect } from 'react';
import { Users, MapPin, Calendar, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Statistics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDestinations: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [usersResult, destinationsResult, reservationsResult, revenueResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('destinations').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('status', { count: 'exact' }),
        supabase.from('reservations').select('total_amount, payment_status'),
      ]);

      const pendingCount = reservationsResult.data?.filter(r => r.status === 'pending').length || 0;
      const confirmedCount = reservationsResult.data?.filter(r => r.status === 'confirmed').length || 0;

      const revenue = revenueResult.data
        ?.filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalDestinations: destinationsResult.count || 0,
        totalReservations: reservationsResult.count || 0,
        pendingReservations: pendingCount,
        confirmedReservations: confirmedCount,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      label: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Destinos Activos',
      value: stats.totalDestinations,
      icon: MapPin,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Reservas',
      value: stats.totalReservations,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Reservas Pendientes',
      value: stats.pendingReservations,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Reservas Confirmadas',
      value: stats.confirmedReservations,
      icon: CheckCircle,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      label: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      isString: true,
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Panel de Estadísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.isString ? card.value : card.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

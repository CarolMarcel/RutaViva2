import { useState } from 'react';
import { LogOut, Users, MapPin, Calendar, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { DestinationManagement } from './DestinationManagement';
import { ReservationManagement } from './ReservationManagement';
import { AuditLogs } from './AuditLogs';
import { Statistics } from './Statistics';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'destinations' | 'reservations' | 'audit'>('stats');

  const tabs = [
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'destinations', label: 'Destinos', icon: MapPin },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    { id: 'audit', label: 'Auditoría', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  RutaViva Admin
                </h1>
                <p className="text-xs text-gray-500">Panel de Administración</p>
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
        <div className="mb-8">
          <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-slate-600 text-slate-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'stats' && <Statistics />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'destinations' && <DestinationManagement />}
          {activeTab === 'reservations' && <ReservationManagement />}
          {activeTab === 'audit' && <AuditLogs />}
        </div>
      </div>
    </div>
  );
}

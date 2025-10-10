import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { validateNumber, sanitizeInput } from '../../lib/validation';
import type { Database } from '../../lib/database.types';

type Destination = Database['public']['Tables']['destinations']['Row'];

export function DestinationManagement() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    price_per_person: '',
    max_capacity: '',
    image_url: '',
    is_active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sanitizedName = sanitizeInput(formData.name);
    if (!sanitizedName || sanitizedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    const price = parseFloat(formData.price_per_person);
    if (!validateNumber(price, 0)) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    const capacity = parseInt(formData.max_capacity);
    if (!validateNumber(capacity, 1)) {
      setError('La capacidad debe ser al menos 1');
      return;
    }

    try {
      const destinationData = {
        name: sanitizedName,
        description: sanitizeInput(formData.description),
        location: sanitizeInput(formData.location),
        price_per_person: price,
        max_capacity: capacity,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from('destinations')
          .update(destinationData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('destinations').insert(destinationData);

        if (error) throw error;
      }

      resetForm();
      loadDestinations();
    } catch (err) {
      console.error('Error saving destination:', err);
      setError('Error al guardar el destino');
    }
  };

  const handleEdit = (destination: Destination) => {
    setFormData({
      name: destination.name,
      description: destination.description || '',
      location: destination.location,
      price_per_person: destination.price_per_person.toString(),
      max_capacity: destination.max_capacity.toString(),
      image_url: destination.image_url || '',
      is_active: destination.is_active,
    });
    setEditingId(destination.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este destino?')) return;

    try {
      const { error } = await supabase.from('destinations').delete().eq('id', id);

      if (error) throw error;
      loadDestinations();
    } catch (err) {
      console.error('Error deleting destination:', err);
      alert('Error al eliminar el destino. Puede tener reservas asociadas.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      price_per_person: '',
      max_capacity: '',
      image_url: '',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando destinos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Destinos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Destino</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Destino' : 'Nuevo Destino'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Persona (COP)
                </label>
                <input
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <div key={destination.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-40">
              <img
                src={destination.image_url || 'https://images.pexels.com/photos/2265876/pexels-photo-2265876.jpeg'}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    destination.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {destination.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{destination.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{destination.location}</p>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{destination.description}</p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Capacidad: {destination.max_capacity}</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(destination.price_per_person)}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(destination)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(destination.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {destinations.length === 0 && !showForm && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No hay destinos creados aún</p>
        </div>
      )}
    </div>
  );
}

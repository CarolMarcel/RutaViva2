import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { destinations } from "../../lib/mockDb";
import { DestinationCard } from "./DestinationCard";

interface Reservation {
  id: number;
  destination: string;
  date: string;
  people: number;
  total: number;
  userEmail: string;
}

export function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Cargar reservas guardadas localmente del usuario actual
  useEffect(() => {
    const savedReservations =
      JSON.parse(localStorage.getItem("rutaviva_reservations") || "[]") || [];
    const userReservations = savedReservations.filter(
      (r: Reservation) => r.userEmail === user?.email
    );
    setReservations(userReservations);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Encabezado */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🌿 Bienvenido/a, {user?.fullName || "Usuario"}
            </h1>
            <p className="text-gray-600 text-sm">
              Gracias por preferir RutaViva — tus aventuras en Chile comienzan aquí!
            </p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Sección de destinos */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Explora nuestros destinos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </section>

        {/* Sección de reservas */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Mis Reservas
          </h2>

          {reservations.length === 0 ? (
            <p className="text-gray-500">
              Aún no tienes reservas registradas.  
              ¡Haz clic en “Reservar ahora” para comenzar tu próxima aventura!
            </p>
          ) : (
            <div className="grid gap-4">
              {reservations.map((reserva) => (
                <div
                  key={reserva.id}
                  className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {reserva.destination}
                  </h3>
                  <p className="text-sm text-gray-600">📅 Fecha: {reserva.date}</p>
                  <p className="text-sm text-gray-600">👥 Personas: {reserva.people}</p>
                  <p className="text-sm text-green-700 font-semibold">
                    💰 Total: ${reserva.total.toLocaleString("es-CL")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

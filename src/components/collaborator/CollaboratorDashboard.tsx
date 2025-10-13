import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";

interface Reservation {
  id: number;
  destination: string;
  date: string;
  people: number;
  total: number;
  userEmail: string;
  status: string;
}

export function CollaboratorDashboard() {
  const { user, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Cargar todas las reservas almacenadas en localStorage
  useEffect(() => {
    const savedReservations =
      JSON.parse(localStorage.getItem("rutaviva_reservations") || "[]") || [];
    setReservations(savedReservations);
  }, []);

  // Marcar una reserva como completada
  const completeReservation = (id: number) => {
    const updated = reservations.map((res) =>
      res.id === id ? { ...res, status: "Completada" } : res
    );
    setReservations(updated);
    localStorage.setItem("rutaviva_reservations", JSON.stringify(updated));
  };

  // Eliminar una reserva
  const deleteReservation = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
      const updated = reservations.filter((res) => res.id !== id);
      setReservations(updated);
      localStorage.setItem("rutaviva_reservations", JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Encabezado */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🌎 Panel del Colaborador
            </h1>
            <p className="text-gray-600 text-sm">
              Bienvenido/a {user?.fullName || "Colaborador"} — gestiona las
              reservas de nuestros clientes
            </p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Lista de reservas */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Reservas registradas
          </h2>

          {reservations.length === 0 ? (
            <p className="text-gray-500">
              No hay reservas registradas en este momento.
            </p>
          ) : (
            <div className="grid gap-4">
              {reservations.map((reserva) => (
                <div
                  key={reserva.id}
                  className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {reserva.destination}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📅 Fecha: {reserva.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        👥 Personas: {reserva.people}
                      </p>
                      <p className="text-sm text-green-700 font-semibold">
                        💰 Total: ${reserva.total.toLocaleString("es-CL")}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        ✉️ Cliente: {reserva.userEmail}
                      </p>
                      <p
                        className={`text-sm mt-2 font-semibold ${
                          reserva.status === "Completada"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Estado: {reserva.status || "Pendiente"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {reserva.status !== "Completada" && (
                        <button
                          onClick={() => completeReservation(reserva.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-600"
                        >
                          Marcar como Completada
                        </button>
                      )}
                      <button
                        onClick={() => deleteReservation(reserva.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { destinations } from "../../lib/mockDb";

interface Reservation {
  id: number;
  destination: string;
  date: string;
  people: number;
  total: number;
  userEmail: string;
  status: string;
}

export function ClientDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState("destinations");
  const [reservations, setReservations] = useState<Reservation[]>(
    JSON.parse(localStorage.getItem("rutaviva_reservations") || "[]")
  );

  const handleReserve = (destination: any) => {
    const date = prompt("Ingresa la fecha de tu reserva (DD/MM/AAAA):");
    const people = Number(prompt("¿Cuántas personas viajarán?"));
    if (!date || !people) return alert("Datos incompletos.");

    const total = destination.price * people;
    const newReservation = {
      id: Date.now(),
      destination: destination.title,
      date,
      people,
      total,
      userEmail: user?.email || "usuario@rutaviva.cl",
      status: "Pendiente",
    };

    const updated = [...reservations, newReservation];
    setReservations(updated);
    localStorage.setItem("rutaviva_reservations", JSON.stringify(updated));
    alert("✅ Reserva creada con éxito.");
  };

  const cancelReservation = (id: number) => {
    if (!confirm("¿Deseas cancelar esta reserva?")) return;
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, status: "Cancelada" } : r
    );
    setReservations(updated);
    localStorage.setItem("rutaviva_reservations", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 border-b pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-700">RutaViva</h1>
            <p className="text-gray-500 text-sm ml-1">| Panel del Cliente</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">{user?.fullName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          <button
            onClick={signOut}
            className="mt-2 bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600"
          >
            Salir
          </button>
        </div>
      </header>

        {/* Tabs */}
        <nav className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setTab("destinations")}
            className={`pb-2 font-semibold ${
              tab === "destinations"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            🌎 Explorar Destinos
          </button>
          <button
            onClick={() => setTab("reservations")}
            className={`pb-2 font-semibold ${
              tab === "reservations"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            📅 Mis Reservas
          </button>
        </nav>

        {/* Sección de destinos */}
        {tab === "destinations" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 overflow-hidden"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {dest.location}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{dest.description}</p>
                  <p className="text-green-700 font-semibold mb-2">
                    💰 ${dest.price?.toLocaleString("es-CL") || "0"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Máx. {dest.maxPeople} personas
                  </p>
                  <button
                    onClick={() => handleReserve(dest)}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    Reservar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sección de reservas */}
        {tab === "reservations" && (
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <p className="text-gray-500">
                Aún no tienes reservas registradas.
              </p>
            ) : (
              reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex justify-between items-start"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {r.destination}
                    </h3>
                    <p className="text-sm text-gray-600">📅 {r.date}</p>
                    <p className="text-sm text-gray-600">👥 {r.people} personas</p>
                    <p className="text-sm text-green-700 font-semibold">
                      💰 ${r.total.toLocaleString("es-CL")}
                    </p>
                    <p
                      className={`text-sm mt-2 font-semibold ${
                        r.status === "Cancelada"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      Estado: {r.status}
                    </p>
                  </div>
                  {r.status !== "Cancelada" && (
                    <button
                      onClick={() => cancelReservation(r.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

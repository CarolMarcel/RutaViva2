import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { destinations } from "../../lib/mockDb";
import logo from "../../assets/logo_4_1.png"; // 🟦 Asegúrate de tener tu logo en src/assets/logo4_1.png

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

  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [notes, setNotes] = useState("");

  const handleReserve = (destination: any) => {
    setSelectedDestination(destination);
    setDate("");
    setPeople(1);
    setNotes("");
  };

  const confirmReservation = () => {
    if (!date || !people) return alert("⚠️ Debes ingresar la fecha y cantidad de personas.");

    const total = selectedDestination.price * people;
    const newReservation = {
      id: Date.now(),
      destination: selectedDestination.name,
      date,
      people,
      total,
      userEmail: user?.email || "usuario@rutaviva.cl",
      status: "Pendiente",
    };

    const updated = [...reservations, newReservation];
    setReservations(updated);
    localStorage.setItem("rutaviva_reservations", JSON.stringify(updated));
    setSelectedDestination(null);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex justify-center items-start py-12 px-6">
      <div className="w-full max-w-[1400px] bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b pb-6">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="RutaViva Logo"
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-blue-700">RutaViva</h1>
              <p className="text-gray-500 text-sm ml-1">| Panel del Cliente</p>
            </div>
          </div>

          {/* Usuario */}
          <div className="text-right">
            <p className="font-semibold text-gray-800 text-lg capitalize">
              {user?.name || "Usuario"} {/* Muestra el nombre registrado */}
            </p>
            <p className="text-sm text-gray-500">{user?.role === "admin" ? "Administrador" : "Cliente"}</p>
            <button
              onClick={signOut}
              className="mt-2 bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Navegación */}
        <nav className="flex gap-10 border-b border-gray-200 mb-10 justify-center">
          <button
            onClick={() => setTab("destinations")}
            className={`pb-3 font-semibold text-lg transition-all ${
              tab === "destinations"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            🌎 Explorar Destinos
          </button>
          <button
            onClick={() => setTab("reservations")}
            className={`pb-3 font-semibold text-lg ${
              tab === "reservations"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            📅 Mis Reservas
          </button>
        </nav>

        {/* Sección de destinos */}
        {tab === "destinations" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white w-[380px] rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-5 flex flex-col justify-between h-64">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{dest.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">📍 {dest.location}</p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {dest.description}
                    </p>
                    <p className="text-green-700 font-semibold mb-1">
                      💰 ${dest.price.toLocaleString("es-CL")}
                    </p>
                    <p className="text-sm text-gray-500">
                      👥 Máx. {dest.maxPeople} personas
                    </p>
                  </div>
                  <button
                    onClick={() => handleReserve(dest)}
                    className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
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
              <p className="text-gray-500 text-center py-10 text-lg">
                Aún no tienes reservas registradas.
              </p>
            ) : (
              reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm flex justify-between items-start hover:shadow-md transition"
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
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600"
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

      {/* Modal de Reserva */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedDestination(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">Realizar Reserva</h2>

            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedDestination.name}
              </h3>
              <p className="text-sm text-gray-600">{selectedDestination.location}</p>
            </div>

            <label className="block mb-2 font-medium">📅 Fecha de la Reserva</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring focus:ring-blue-200"
            />

            <label className="block mb-2 font-medium">
              👥 Número de Personas (Máx. {selectedDestination.maxPeople})
            </label>
            <input
              type="number"
              value={people}
              min={1}
              max={selectedDestination.maxPeople}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring focus:ring-blue-200"
            />

            <label className="block mb-2 font-medium">📝 Solicitudes Especiales (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Menciona algún requerimiento especial..."
              className="w-full border rounded-lg px-3 py-2 mb-6 focus:ring focus:ring-blue-200"
            />

            <div className="border-t pt-4 flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-700">
                ${ (selectedDestination.price * people).toLocaleString("es-CL") }
              </span>
            </div>

            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setSelectedDestination(null)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReservation}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Reservation {
  id: number;
  destination: string;
  date: string;
  people: number;
  total: number;
  userEmail: string;
  status: string;
}

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Cargar datos simulados
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("rutaviva_users") || "[]");
    const savedReservations = JSON.parse(
      localStorage.getItem("rutaviva_reservations") || "[]"
    );

    setUsers(savedUsers);
    setReservations(savedReservations);
  }, []);

  // Eliminar una reserva
  const deleteReservation = (id: number) => {
    if (confirm("¿Seguro que deseas eliminar esta reserva?")) {
      const updated = reservations.filter((r) => r.id !== id);
      setReservations(updated);
      localStorage.setItem("rutaviva_reservations", JSON.stringify(updated));
    }
  };

  // Reset completo del sistema
  const resetData = () => {
    if (confirm("⚠️ Esto eliminará todos los datos locales del sistema. ¿Deseas continuar?")) {
      localStorage.removeItem("rutaviva_users");
      localStorage.removeItem("rutaviva_reservations");
      alert("Sistema restaurado a valores iniciales.");
      setUsers([]);
      setReservations([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* ENCABEZADO */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🧭 Panel del Administrador
            </h1>
            <p className="text-gray-600 text-sm">
              Bienvenido, {user?.fullName || "Administrador"} — supervisa usuarios y reservas
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetData}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600"
            >
              Restaurar Datos
            </button>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* SECCIÓN DE USUARIOS */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">👤 Usuarios Registrados</h2>

          {users.length === 0 ? (
            <p className="text-gray-500">No hay usuarios registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-xl">
                <thead className="bg-blue-50 text-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left">Nombre</th>
                    <th className="py-2 px-4 text-left">Correo</th>
                    <th className="py-2 px-4 text-left">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-4">{u.fullName}</td>
                      <td className="py-2 px-4">{u.email}</td>
                      <td className="py-2 px-4 capitalize text-blue-600 font-medium">
                        {u.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECCIÓN DE RESERVAS */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Reservas Registradas</h2>

          {reservations.length === 0 ? (
            <p className="text-gray-500">No hay reservas realizadas.</p>
          ) : (
            <div className="grid gap-4">
              {reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {r.destination}
                      </h3>
                      <p className="text-sm text-gray-600">📅 Fecha: {r.date}</p>
                      <p className="text-sm text-gray-600">👥 Personas: {r.people}</p>
                      <p className="text-sm text-green-700 font-semibold">
                        💰 Total: ${r.total.toLocaleString("es-CL")}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">✉️ Cliente: {r.userEmail}</p>
                      <p
                        className={`text-sm mt-2 font-semibold ${
                          r.status === "Completada"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Estado: {r.status || "Pendiente"}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteReservation(r.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600"
                    >
                      Eliminar
                    </button>
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

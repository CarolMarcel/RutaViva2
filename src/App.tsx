import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ClientDashboard } from "./components/client/ClientDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { CollaboratorDashboard } from "./components/collaborator/CollaboratorDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AuthFlow() {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      {authMode === "login" && (
        <Login
          onToggleMode={() => setAuthMode("register")}
          onForgotPassword={() => setAuthMode("forgot")}
        />
      )}
      {authMode === "register" && (
        <Register onToggleMode={() => setAuthMode("login")} />
      )}
      {authMode === "forgot" && (
        <ForgotPassword onBack={() => setAuthMode("login")} />
      )}
    </div>
  );
}

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthFlow />;
  }

  switch (user.role) {
    case "admin":
      return (
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      );
    case "collaborator":
      return (
        <ProtectedRoute allowedRoles={["collaborator"]}>
          <CollaboratorDashboard />
        </ProtectedRoute>
      );
    case "client":
    default:
      return (
        <ProtectedRoute allowedRoles={["client"]}>
          <ClientDashboard />
        </ProtectedRoute>
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
}

export default App;



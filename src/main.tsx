import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

function RootApp() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center h-screen bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Cargando aplicación...</p>
              </div>
            </div>
          }
        >
          <App />
        </React.Suspense>
      </AuthProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<RootApp />);



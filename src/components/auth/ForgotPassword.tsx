import { useState } from "react";
import logo from "../../assets/logo_4_1.png";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("❌ Ingresa tu correo");
    alert("📩 Se enviaron las instrucciones a tu correo (modo demo)");
    onBack();
  };

  return (
    <div
      style={{
        background: "linear-gradient(to bottom right, #f0f9ff, #fefefe, #ecfdf5)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="auth-box" style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src={logo}
            alt="RutaViva Logo"
            style={{ height: "70px", margin: "0 auto" }}
          />
        </div>

        <h2 style={{ textAlign: "center" }}>Recuperar Contraseña</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Ingresa tu correo para recibir instrucciones
        </p>

        <form onSubmit={handleSubmit}>
          <label>Correo Electrónico</label>
          <input
            type="email"
            className="auth-input"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary w-full">
            Enviar Instrucciones
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={onBack}
            style={{
              color: "#2563eb",
              fontWeight: "600",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}

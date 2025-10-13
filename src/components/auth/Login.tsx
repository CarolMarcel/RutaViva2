import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo_4_1.png";

interface LoginProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export function Login({ onToggleMode, onForgotPassword }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = signIn(email, password);
    if (!ok) alert("❌ Credenciales incorrectas");
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom right, #f0f9ff, #fefefe, #ecfdf5)",
      }}
    >
      <div className="auth-box">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src={logo}
            alt="RutaViva Logo"
            style={{ height: "70px", margin: "0 auto" }}
          />
        </div>

        <h2 style={{ textAlign: "center" }}>Bienvenido a RutaViva</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Inicia sesión para continuar
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

          <label>Contraseña</label>
          <input
            type="password"
            className="auth-input"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={onForgotPassword}
              style={{
                fontSize: "0.9rem",
                color: "#2563eb",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className="btn-primary w-full">
            Iniciar Sesión
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.95rem",
            color: "#4b5563",
          }}
        >
          ¿No tienes cuenta?{" "}
          <button
            onClick={onToggleMode}
            style={{
              color: "#2563eb",
              fontWeight: "600",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}

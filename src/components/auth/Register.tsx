import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo_4_1.png";

interface RegisterProps {
  onToggleMode: () => void;
}

export function Register({ onToggleMode }: RegisterProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }
    signUp(email, password);
    alert("✅ Cuenta creada correctamente");
    onToggleMode();
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

        <h2 style={{ textAlign: "center" }}>Crear Cuenta</h2>
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Únete a RutaViva hoy
        </p>

        <form onSubmit={handleSubmit}>
          <label>Nombre Completo</label>
          <input
            type="text"
            className="auth-input"
            placeholder="Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Correo Electrónico</label>
          <input
            type="email"
            className="auth-input"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Teléfono</label>
          <input
            type="tel"
            className="auth-input"
            placeholder="+56 9 1234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          <small style={{ color: "#6b7280" }}>
            Mínimo 8 caracteres, una mayúscula, una minúscula y un número
          </small>

          <label style={{ marginTop: "1rem" }}>Confirmar Contraseña</label>
          <input
            type="password"
            className="auth-input"
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary w-full">
            Crear Cuenta
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
          ¿Ya tienes cuenta?{" "}
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
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}





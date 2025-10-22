🌿 RutaViva

RutaViva es una aplicación web desarrollada en React + TypeScript + Vite que permite gestionar rutas turísticas, reservas y usuarios con diferentes roles (administrador, cliente y colaborador).

Su objetivo es ofrecer una experiencia rápida, moderna y accesible para cada tipo de usuario.

🚀 Características principales:

    - 🔐 Autenticación completa (login, registro, recuperación de contraseña).

    - 🧭 Panel de cliente con visualización de información personal, reservas y destinos.

    - 🧑‍💼 Panel de administrador para gestión interna.

    - 👥 Panel de colaborador para seguimiento operativo.

    - 🗺️ Gestión de rutas y reservas desde formularios interactivos.

    - ⚙️ Protección de rutas según tipo de usuario (ProtectedRoute.tsx).

    - 💾 Base de datos simulada localmente mediante mockDb.ts y localDB.ts.

    - 🧩 Estructura modular y reutilizable, con separación clara entre componentes, contextos y librerías.

    - 🎨 Interfaz moderna basada en TailwindCSS.


🧩 Tecnologías utilizadas

| Tipo                       | Tecnologías                                         |
| -------------------------- | --------------------------------------------------- |
| **Frontend**               | React 18 + TypeScript + Vite                        |
| **Estilos**                | TailwindCSS + PostCSS                               |
| **Gestión de estado**      | Context API                                         |
| **Autenticación**          | AuthContext + LocalStorage (mock)                   |
| **Utilidades**             | Eslint, Vite env types, Validaciones personalizadas |
| **Despliegue recomendado** | Netlify / Vercel                                    |

Instalar dependencias: 

        npm install

Ejecutar el servidor de desarrollo:

        npm run dev

El proyecto se abrirá automáticamente en
👉 http://localhost:5173

💡 Uso general:

    1. Inicia sesión con una cuenta de usuario (cliente, colaborador o administrador).

    2. El sistema detectará automáticamente el rol y redirigirá al Dashboard correspondiente:

        - /admin/dashboard

        - /client/dashboard

        - /collaborator/dashboard

    3. Cada vista muestra componentes y datos adaptados al usuario.

    4. Puedes cerrar sesión con el botón "Salir" desde el encabezado.

🧠 Componentes destacados: 

| Componente            | Descripción                                         |
| --------------------- | --------------------------------------------------- |
| `Login.tsx`           | Maneja el inicio de sesión del usuario.             |
| `Register.tsx`        | Permite registrar nuevos usuarios.                  |
| `ClientDashboard.tsx` | Panel principal para clientes.                      |
| `DestinationCard.tsx` | Muestra destinos disponibles.                       |
| `AuthContext.tsx`     | Controla sesión, logout e información del usuario.  |
| `ProtectedRoute.tsx`  | Protege rutas según el tipo de usuario autenticado. |

💬 Notas finales:

“RutaViva” representa un puente entre el turismo digital y la experiencia humana, ofreciendo una plataforma segura, clara y adaptable a cada tipo de usuario.
// mockDb.ts
// 🌎 Datos de ejemplo para funcionar en modo local

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  price: number;
  maxPeople: number;
  image: string;
}

export const destinations: Destination[] = [
  {
    id: 1,
    name: "Torres del Paine",
    location: "Región de Magallanes, Chile",
    description:
      "Explora los imponentes paisajes del Parque Nacional Torres del Paine. Uno de los parques nacionales más impresionantes del mundo, famoso por sus montañas, glaciares y lagos turquesa..",
    price: 180000,
    maxPeople: 15,
    image:
      "https://chileestuyo.cl/wp-content/uploads/2021/03/parque-nacional-torres-del-paine.jpg",
  },
  {
    id: 2,
    name: "San Pedro de Atacama",
    location: "Región de Antofagasta",
    description:
      "El desierto más árido del mundo, con paisajes únicos, géiseres, salares y el impresionante Valle de la Luna.",
    price: 140000,
    maxPeople: 20,
    image:
      "https://www.vertice.travel/wp-content/uploads/2023/08/VERTICE-San-Pedro-Esencial_Laguna-Chaxa.png",
  },
  {
    id: 3,
    name: "Isla de Chiloé",
    location: "Región de Los Lagos, Chile",
    description:
      "Vive la magia del sur con su arquitectura de palafitos, mitología local, gastronomía única y naturaleza exuberante.",
    price: 125000,
    maxPeople: 15,
    image:
      "https://www.skorpios.cl/wp-content/uploads/Isla-de-Chilo%C3%A9.jpg",
  },
];

export interface Reservation {
  id: number;
  destinationId: number;
  user: string;
  date: string;
  people: number;
  total: number;
  status: "Pendiente" | "Cancelada" | "Pagada";
}

export const reservations: Reservation[] = [
  {
    id: 1,
    destinationId: 1,
    user: "Carol Marcel",
    date: "2025-10-21",
    people: 2,
    total: 500000,
    status: "Pendiente",
  },
  {
    id: 2,
    destinationId: 2,
    user: "Carol Marcel",
    date: "2025-10-20",
    people: 4,
    total: 760000,
    status: "Cancelada",
  },
];
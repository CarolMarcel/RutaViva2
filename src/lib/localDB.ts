// src/lib/localDB.ts
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'admin' | 'collaborator';
}

export interface Reservation {
  id: string;
  clientId: string;
  destinationId: number;
  date: string;
  numberOfPeople: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const USERS_KEY = 'rv_users';
const RESERVATIONS_KEY = 'rv_reservations';

// 🔹 Usuarios
export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function addUser(user: User) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(email: string) {
  return getUsers().find((u) => u.email === email);
}

export function loginUser(email: string, password: string) {
  return getUsers().find((u) => u.email === email && u.password === password);
}

// 🔹 Reservas
export function getReservations(): Reservation[] {
  return JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]');
}

export function addReservation(reservation: Reservation) {
  const list = getReservations();
  list.push(reservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
}

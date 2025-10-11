// src/lib/mockDb.ts
// Simple "DB" usando localStorage; guarda "auth.users" y "profiles".
// Muy útil para desarrollo local sin Supabase real.

import { v4 as uuidv4 } from "uuid";

type StoredUser = {
  id: string;
  email: string;
  // puedes añadir más campos si tu app los espera (created_at, etc.)
};

type Profile = {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  [key: string]: unknown;
};

const USERS_KEY = "mockdb_users";
const PROFILES_KEY = "mockdb_profiles";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export const mockDb = {
  getUsers(): StoredUser[] {
    return read<StoredUser>(USERS_KEY);
  },

  getProfiles(): Profile[] {
    return read<Profile>(PROFILES_KEY);
  },

  saveUsers(users: StoredUser[]) {
    write(USERS_KEY, users);
  },

  saveProfiles(profiles: Profile[]) {
    write(PROFILES_KEY, profiles);
  },

  createUser(email: string) {
    const users = this.getUsers();
    // emular que el id es UUID
    const id = uuidv4();
    const user = { id, email };
    users.push(user);
    this.saveUsers(users);
    return user;
  },

  findUserByEmail(email: string) {
    return this.getUsers().find((u) => u.email === email) ?? null;
  },

  findUserById(id: string) {
    return this.getUsers().find((u) => u.id === id) ?? null;
  },

  createProfileForUser(userId: string, email: string) {
    const profiles = this.getProfiles();
    const existing = profiles.find((p) => p.id === userId);
    if (existing) return existing;
    const profile: Profile = { id: userId, email, full_name: "", role: "client" };
    profiles.push(profile);
    this.saveProfiles(profiles);
    return profile;
  },

  findProfileById(id: string) {
    return this.getProfiles().find((p) => p.id === id) ?? null;
  },

  seedIfEmpty() {
    // opcional: seed inicial (solo si no hay nada)
    if (this.getUsers().length === 0) {
      const u = this.createUser("admin@example.com");
      this.createProfileForUser(u.id, u.email);
    }
  },

  clearAll() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(PROFILES_KEY);
  },
};

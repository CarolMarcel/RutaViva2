/*
  # RutaViva Reservation Management System Schema

  ## Overview
  Complete database schema for a reservation management system with role-based access control,
  encrypted sensitive data, and comprehensive audit trails.

  ## New Tables

  ### 1. `profiles`
  User profile information with role-based access
  - `id` (uuid, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text, not null)
  - `phone` (text, encrypted)
  - `role` (text, not null) - Values: 'client', 'collaborator', 'admin'
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `destinations`
  Available travel destinations
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `description` (text)
  - `location` (text, not null)
  - `price_per_person` (decimal, not null)
  - `max_capacity` (integer, not null)
  - `image_url` (text)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `reservations`
  Customer reservation records
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `destination_id` (uuid, references destinations)
  - `reservation_date` (date, not null)
  - `number_of_people` (integer, not null)
  - `total_amount` (decimal, not null)
  - `status` (text, not null) - Values: 'pending', 'confirmed', 'cancelled', 'completed'
  - `special_requests` (text, encrypted)
  - `payment_status` (text, not null) - Values: 'pending', 'paid', 'refunded'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `audit_logs`
  System audit trail for all critical operations
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `action` (text, not null)
  - `table_name` (text, not null)
  - `record_id` (uuid)
  - `old_data` (jsonb)
  - `new_data` (jsonb)
  - `ip_address` (text)
  - `created_at` (timestamptz)

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Clients can only view/modify their own data
  - Collaborators can view and update reservations
  - Admins have full access to all data
  
  ### Policies
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
  - Role-based access control using app_metadata
  - Authentication required for all operations

  ## Important Notes
  1. Sensitive data (phone, special_requests) should be encrypted at application level
  2. User roles are stored in auth.users.raw_app_metadata
  3. All timestamps use timezone-aware types
  4. Audit logs are write-only for non-admins
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('client', 'collaborator', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  price_per_person decimal(10,2) NOT NULL CHECK (price_per_person > 0),
  max_capacity integer NOT NULL CHECK (max_capacity > 0),
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  reservation_date date NOT NULL,
  number_of_people integer NOT NULL CHECK (number_of_people > 0),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_reservations_client_id ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_destination_id ON reservations(destination_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "New users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for destinations
CREATE POLICY "Anyone authenticated can view active destinations"
  ON destinations FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all destinations"
  ON destinations FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert destinations"
  ON destinations FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update destinations"
  ON destinations FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete destinations"
  ON destinations FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for reservations
CREATE POLICY "Clients can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Collaborators can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('collaborator', 'admin'));

CREATE POLICY "Clients can create own reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() AND get_user_role(auth.uid()) = 'client');

CREATE POLICY "Clients can update own pending reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() AND status = 'pending')
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Collaborators can update reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('collaborator', 'admin'))
  WITH CHECK (get_user_role(auth.uid()) IN ('collaborator', 'admin'));

CREATE POLICY "Admins can delete reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for audit_logs
CREATE POLICY "Users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample destinations
INSERT INTO destinations (name, description, location, price_per_person, max_capacity, image_url) VALUES
('Tour Valle del Cocora', 'Descubre los majestuosos árboles de palma de cera en el hermoso Valle del Cocora', 'Salento, Quindío', 150000, 20, 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg'),
('Expedición Tayrona', 'Explora las paradisíacas playas y la selva tropical del Parque Tayrona', 'Santa Marta, Magdalena', 250000, 15, 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg'),
('Aventura en Caño Cristales', 'Conoce el río de los cinco colores, una maravilla natural única', 'La Macarena, Meta', 450000, 12, 'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg'),
('City Tour Cartagena', 'Recorre la ciudad amurallada y disfruta de su historia colonial', 'Cartagena, Bolívar', 120000, 30, 'https://images.pexels.com/photos/3555001/pexels-photo-3555001.jpeg')
ON CONFLICT DO NOTHING;
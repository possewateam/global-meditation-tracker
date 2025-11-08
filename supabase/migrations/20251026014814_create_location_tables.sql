/*
  # Create Location Management System (Countries, States, Cities)

  1. New Tables
    - `countries`
      - `id` (uuid, primary key)
      - `name` (text) - Country name in English
      - `code` (text, unique) - ISO 3166-1 alpha-2 country code (e.g., 'IN', 'US')
      - `dial_code` (text) - International dialing code (e.g., '+91')
      - `created_at` (timestamptz)
      
    - `states`
      - `id` (uuid, primary key)
      - `country_id` (uuid, foreign key to countries)
      - `name` (text) - State/Province name
      - `code` (text) - State code (e.g., 'KA', 'MH')
      - `created_at` (timestamptz)
      
    - `cities`
      - `id` (uuid, primary key)
      - `state_id` (uuid, foreign key to states)
      - `name` (text) - City name
      - `created_at` (timestamptz)
  
  2. Indexes
    - Index on states.country_id for faster lookups
    - Index on cities.state_id for faster lookups
    - Unique index on countries.code
    - Index on states.code for optional lookups
  
  3. Security
    - Enable RLS on all tables
    - Allow public read access (anyone can view location data)
    - Restrict write access to authenticated admin users only
*/

-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  dial_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create states table
CREATE TABLE IF NOT EXISTS public.states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz DEFAULT now()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_states_country_id ON public.states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON public.cities(state_id);
CREATE INDEX IF NOT EXISTS idx_countries_code ON public.countries(code);
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states(code);

-- Enable Row Level Security
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow everyone to read location data (public data)
CREATE POLICY "Anyone can view countries"
  ON public.countries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view states"
  ON public.states FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view cities"
  ON public.cities FOR SELECT
  TO public
  USING (true);

-- RLS Policies: Only authenticated admin users can insert/update/delete
CREATE POLICY "Admins can insert countries"
  ON public.countries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update countries"
  ON public.countries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete countries"
  ON public.countries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can insert states"
  ON public.states FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update states"
  ON public.states FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete states"
  ON public.states FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can insert cities"
  ON public.cities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update cities"
  ON public.cities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete cities"
  ON public.cities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

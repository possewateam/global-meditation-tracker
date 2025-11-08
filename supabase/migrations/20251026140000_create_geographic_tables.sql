/*
  # Create Geographic Location Tables

  ## Overview
  This migration creates a comprehensive geographic data system with three hierarchical levels:
  country → state/province → district. Data is cached from GeoNames API to minimize external
  API calls and improve performance.

  ## New Tables

  ### `geo_countries`
  Stores country-level geographic data from GeoNames
  - `id` (bigint, primary key) - Auto-incrementing identifier
  - `name` (text, required) - Full country name
  - `iso2` (text, required, unique) - ISO 3166-1 alpha-2 code
  - `geoname_id` (bigint, required, unique) - GeoNames unique identifier
  - `updated_at` (timestamptz) - Last cache update timestamp

  ### `geo_states`
  Stores state/province/admin1 level geographic data
  - `id` (bigint, primary key) - Auto-incrementing identifier
  - `country_iso2` (text, required) - Foreign reference to parent country
  - `name` (text, required) - State/province name
  - `code` (text, required) - State code (e.g., "CA", "RJ")
  - `geoname_id` (bigint, required, unique) - GeoNames unique identifier
  - `updated_at` (timestamptz) - Last cache update timestamp

  ### `geo_districts`
  Stores district/admin2 level geographic data
  - `id` (bigint, primary key) - Auto-incrementing identifier
  - `country_iso2` (text, required) - Foreign reference to parent country
  - `state_code` (text, required) - Foreign reference to parent state
  - `name` (text, required) - District name
  - `geoname_id` (bigint, required, unique) - GeoNames unique identifier
  - `updated_at` (timestamptz) - Last cache update timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for all geographic data (required for registration flow)
  - No public write access (data only modified via Edge Functions)

  ## Indexes
  - Created on foreign key columns for query optimization
  - Created on geoname_id for fast lookups during cache validation

  ## Important Notes
  1. Data is populated via Edge Functions that call GeoNames API
  2. 30-day cache expiration policy managed in application layer
  3. All tables use bigint IDs to accommodate large datasets
*/

-- Create countries table
CREATE TABLE IF NOT EXISTS geo_countries (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  iso2 text NOT NULL UNIQUE,
  geoname_id bigint NOT NULL UNIQUE,
  updated_at timestamptz DEFAULT now()
);

-- Create states/provinces table
CREATE TABLE IF NOT EXISTS geo_states (
  id bigserial PRIMARY KEY,
  country_iso2 text NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  geoname_id bigint NOT NULL UNIQUE,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_country FOREIGN KEY (country_iso2) REFERENCES geo_countries(iso2) ON DELETE CASCADE
);

-- Create districts table
CREATE TABLE IF NOT EXISTS geo_districts (
  id bigserial PRIMARY KEY,
  country_iso2 text NOT NULL,
  state_code text NOT NULL,
  name text NOT NULL,
  geoname_id bigint NOT NULL UNIQUE,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_geo_states_country ON geo_states(country_iso2);
CREATE INDEX IF NOT EXISTS idx_geo_districts_country ON geo_districts(country_iso2);
CREATE INDEX IF NOT EXISTS idx_geo_districts_state ON geo_districts(country_iso2, state_code);

-- Enable Row Level Security
ALTER TABLE geo_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_districts ENABLE ROW LEVEL SECURITY;

-- Public read access for all geographic data (required for registration)
CREATE POLICY "Anyone can read countries"
  ON geo_countries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read states"
  ON geo_states FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read districts"
  ON geo_districts FOR SELECT
  TO public
  USING (true);

-- Service role write access (for Edge Functions to populate cache)
CREATE POLICY "Service role can insert countries"
  ON geo_countries FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update countries"
  ON geo_countries FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert states"
  ON geo_states FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update states"
  ON geo_states FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert districts"
  ON geo_districts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update districts"
  ON geo_districts FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

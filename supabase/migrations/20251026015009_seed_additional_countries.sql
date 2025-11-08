/*
  # Seed Additional Countries and Major Cities
  
  1. Countries Added
    - United States
    - United Kingdom
    - Canada
    - Australia
    - United Arab Emirates
    - Singapore
    - Germany
    - France
    
  2. Notes
    - Includes major states/provinces for each country
    - Includes major cities for popular destinations
    - Supports international user base
*/

-- Insert additional countries
INSERT INTO public.countries (code, name, dial_code) VALUES 
  ('US', 'United States', '+1'),
  ('GB', 'United Kingdom', '+44'),
  ('CA', 'Canada', '+1'),
  ('AU', 'Australia', '+61'),
  ('AE', 'United Arab Emirates', '+971'),
  ('SG', 'Singapore', '+65'),
  ('DE', 'Germany', '+49'),
  ('FR', 'France', '+33'),
  ('NP', 'Nepal', '+977'),
  ('PK', 'Pakistan', '+92'),
  ('BD', 'Bangladesh', '+880'),
  ('LK', 'Sri Lanka', '+94'),
  ('MY', 'Malaysia', '+60'),
  ('TH', 'Thailand', '+66')
ON CONFLICT (code) DO NOTHING;

-- Seed data for additional countries
DO $$
DECLARE
  us_id uuid;
  uk_id uuid;
  canada_id uuid;
  australia_id uuid;
  uae_id uuid;
  singapore_id uuid;
  california_id uuid;
  texas_id uuid;
  new_york_id uuid;
  england_id uuid;
  scotland_id uuid;
  ontario_id uuid;
  nsw_id uuid;
  dubai_id uuid;
  abu_dhabi_id uuid;
  sg_id uuid;
BEGIN
  -- Get country IDs
  SELECT id INTO us_id FROM public.countries WHERE code = 'US';
  SELECT id INTO uk_id FROM public.countries WHERE code = 'GB';
  SELECT id INTO canada_id FROM public.countries WHERE code = 'CA';
  SELECT id INTO australia_id FROM public.countries WHERE code = 'AU';
  SELECT id INTO uae_id FROM public.countries WHERE code = 'AE';
  SELECT id INTO singapore_id FROM public.countries WHERE code = 'SG';
  
  -- United States states
  IF us_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES 
      (us_id, 'California', 'CA'),
      (us_id, 'Texas', 'TX'),
      (us_id, 'New York', 'NY'),
      (us_id, 'Florida', 'FL'),
      (us_id, 'Illinois', 'IL'),
      (us_id, 'Pennsylvania', 'PA'),
      (us_id, 'Ohio', 'OH'),
      (us_id, 'Georgia', 'GA'),
      (us_id, 'North Carolina', 'NC'),
      (us_id, 'Michigan', 'MI')
    ON CONFLICT DO NOTHING;
    
    -- Get state IDs
    SELECT id INTO california_id FROM public.states WHERE code = 'CA' AND country_id = us_id;
    SELECT id INTO texas_id FROM public.states WHERE code = 'TX' AND country_id = us_id;
    SELECT id INTO new_york_id FROM public.states WHERE code = 'NY' AND country_id = us_id;
    
    -- California cities
    IF california_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (california_id, 'Los Angeles'), (california_id, 'San Francisco'), (california_id, 'San Diego'),
        (california_id, 'San Jose'), (california_id, 'Sacramento'), (california_id, 'Fresno'),
        (california_id, 'Oakland'), (california_id, 'Santa Clara'), (california_id, 'Irvine')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Texas cities
    IF texas_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (texas_id, 'Houston'), (texas_id, 'Dallas'), (texas_id, 'Austin'),
        (texas_id, 'San Antonio'), (texas_id, 'Fort Worth'), (texas_id, 'El Paso')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- New York cities
    IF new_york_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (new_york_id, 'New York City'), (new_york_id, 'Buffalo'), (new_york_id, 'Rochester'),
        (new_york_id, 'Albany'), (new_york_id, 'Syracuse')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- United Kingdom regions
  IF uk_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES 
      (uk_id, 'England', 'ENG'),
      (uk_id, 'Scotland', 'SCT'),
      (uk_id, 'Wales', 'WLS'),
      (uk_id, 'Northern Ireland', 'NIR')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO england_id FROM public.states WHERE code = 'ENG' AND country_id = uk_id;
    SELECT id INTO scotland_id FROM public.states WHERE code = 'SCT' AND country_id = uk_id;
    
    -- England cities
    IF england_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (england_id, 'London'), (england_id, 'Manchester'), (england_id, 'Birmingham'),
        (england_id, 'Leeds'), (england_id, 'Liverpool'), (england_id, 'Bristol'),
        (england_id, 'Newcastle'), (england_id, 'Sheffield'), (england_id, 'Leicester')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Scotland cities
    IF scotland_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (scotland_id, 'Edinburgh'), (scotland_id, 'Glasgow'), (scotland_id, 'Aberdeen'),
        (scotland_id, 'Dundee')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Canada provinces
  IF canada_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES 
      (canada_id, 'Ontario', 'ON'),
      (canada_id, 'Quebec', 'QC'),
      (canada_id, 'British Columbia', 'BC'),
      (canada_id, 'Alberta', 'AB'),
      (canada_id, 'Manitoba', 'MB'),
      (canada_id, 'Saskatchewan', 'SK')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO ontario_id FROM public.states WHERE code = 'ON' AND country_id = canada_id;
    
    -- Ontario cities
    IF ontario_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (ontario_id, 'Toronto'), (ontario_id, 'Ottawa'), (ontario_id, 'Mississauga'),
        (ontario_id, 'Brampton'), (ontario_id, 'Hamilton'), (ontario_id, 'London')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Australia states
  IF australia_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES 
      (australia_id, 'New South Wales', 'NSW'),
      (australia_id, 'Victoria', 'VIC'),
      (australia_id, 'Queensland', 'QLD'),
      (australia_id, 'Western Australia', 'WA'),
      (australia_id, 'South Australia', 'SA')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO nsw_id FROM public.states WHERE code = 'NSW' AND country_id = australia_id;
    
    -- NSW cities
    IF nsw_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (nsw_id, 'Sydney'), (nsw_id, 'Newcastle'), (nsw_id, 'Wollongong'),
        (nsw_id, 'Central Coast'), (nsw_id, 'Maitland')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- UAE emirates
  IF uae_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES 
      (uae_id, 'Dubai', 'DU'),
      (uae_id, 'Abu Dhabi', 'AZ'),
      (uae_id, 'Sharjah', 'SH'),
      (uae_id, 'Ajman', 'AJ'),
      (uae_id, 'Ras Al Khaimah', 'RK')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO dubai_id FROM public.states WHERE code = 'DU' AND country_id = uae_id;
    SELECT id INTO abu_dhabi_id FROM public.states WHERE code = 'AZ' AND country_id = uae_id;
    
    -- Dubai areas
    IF dubai_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (dubai_id, 'Dubai'), (dubai_id, 'Deira'), (dubai_id, 'Bur Dubai'),
        (dubai_id, 'Jumeirah'), (dubai_id, 'Dubai Marina')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Abu Dhabi areas
    IF abu_dhabi_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (abu_dhabi_id, 'Abu Dhabi'), (abu_dhabi_id, 'Al Ain'), (abu_dhabi_id, 'Ruwais')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Singapore (city-state)
  IF singapore_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES 
      (singapore_id, 'Singapore', 'SG')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO sg_id FROM public.states WHERE code = 'SG' AND country_id = singapore_id;
    
    IF sg_id IS NOT NULL THEN
      INSERT INTO public.cities (state_id, name) VALUES 
        (sg_id, 'Singapore')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
END $$;

/*
  # Seed Major Cities Worldwide
  
  1. Cities Added For:
    - Major US states
    - Major world countries provinces
    
  2. Notes
    - Focuses on major metropolitan cities
*/

DO $$
DECLARE
  v_state_id uuid;
BEGIN
  -- US California Cities
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'CA' AND c.code = 'US';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Los Angeles'), (v_state_id, 'San Diego'), (v_state_id, 'San Jose'),
      (v_state_id, 'San Francisco'), (v_state_id, 'Fresno'), (v_state_id, 'Sacramento'),
      (v_state_id, 'Long Beach'), (v_state_id, 'Oakland'), (v_state_id, 'Bakersfield'),
      (v_state_id, 'Anaheim'), (v_state_id, 'Santa Ana'), (v_state_id, 'Riverside')
    ON CONFLICT DO NOTHING;
  END IF;

  -- US Texas Cities  
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'TX' AND c.code = 'US';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Houston'), (v_state_id, 'San Antonio'), (v_state_id, 'Dallas'),
      (v_state_id, 'Austin'), (v_state_id, 'Fort Worth'), (v_state_id, 'El Paso')
    ON CONFLICT DO NOTHING;
  END IF;

  -- US New York Cities
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'NY' AND c.code = 'US';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'New York City'), (v_state_id, 'Buffalo'), (v_state_id, 'Rochester'),
      (v_state_id, 'Syracuse'), (v_state_id, 'Albany')
    ON CONFLICT DO NOTHING;
  END IF;

  -- US Florida Cities
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'FL' AND c.code = 'US';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Jacksonville'), (v_state_id, 'Miami'), (v_state_id, 'Tampa'),
      (v_state_id, 'Orlando'), (v_state_id, 'St. Petersburg')
    ON CONFLICT DO NOTHING;
  END IF;

  -- China Beijing
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'BJ' AND c.code = 'CN';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Beijing'), (v_state_id, 'Chaoyang'), (v_state_id, 'Haidian')
    ON CONFLICT DO NOTHING;
  END IF;

  -- China Shanghai
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'SH' AND c.code = 'CN';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Shanghai'), (v_state_id, 'Pudong'), (v_state_id, 'Minhang')
    ON CONFLICT DO NOTHING;
  END IF;

  -- China Guangdong
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'GD' AND c.code = 'CN';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Guangzhou'), (v_state_id, 'Shenzhen'), (v_state_id, 'Dongguan')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Brazil São Paulo
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'SP' AND c.code = 'BR';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'São Paulo'), (v_state_id, 'Guarulhos'), (v_state_id, 'Campinas')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Germany Bavaria
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'BY' AND c.code = 'DE';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Munich'), (v_state_id, 'Nuremberg'), (v_state_id, 'Augsburg')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Pakistan Punjab
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'PB' AND c.code = 'PK';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Lahore'), (v_state_id, 'Faisalabad'), (v_state_id, 'Rawalpindi')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Bangladesh Dhaka
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'C' AND c.code = 'BD';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Dhaka'), (v_state_id, 'Gazipur'), (v_state_id, 'Narayanganj')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nigeria Lagos
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'LA' AND c.code = 'NG';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Lagos'), (v_state_id, 'Ikeja'), (v_state_id, 'Epe')
    ON CONFLICT DO NOTHING;
  END IF;

  -- South Africa Gauteng
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'GP' AND c.code = 'ZA';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Johannesburg'), (v_state_id, 'Pretoria'), (v_state_id, 'Soweto')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Japan Tokyo
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = '13' AND c.code = 'JP';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Tokyo'), (v_state_id, 'Shinjuku'), (v_state_id, 'Shibuya')
    ON CONFLICT DO NOTHING;
  END IF;

  -- South Korea Seoul
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = '11' AND c.code = 'KR';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Seoul'), (v_state_id, 'Gangnam'), (v_state_id, 'Jongno')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Indonesia Jakarta
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'JK' AND c.code = 'ID';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Jakarta'), (v_state_id, 'South Jakarta'), (v_state_id, 'East Jakarta')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Philippines Metro Manila
  SELECT s.id INTO v_state_id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE s.code = 'NCR' AND c.code = 'PH';
  IF v_state_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES
      (v_state_id, 'Manila'), (v_state_id, 'Quezon City'), (v_state_id, 'Makati')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

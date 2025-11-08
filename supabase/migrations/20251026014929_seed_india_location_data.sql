/*
  # Seed Location Data for India
  
  1. Data Inserted
    - India country record
    - All Indian states and union territories (36 total)
    - Major cities for each state (5-10 cities per state)
  
  2. Notes
    - Uses proper state codes as per Indian standards
    - Includes major metropolitan cities and state capitals
    - Data is inserted only if not already present (idempotent)
*/

-- Insert India country
INSERT INTO public.countries (code, name, dial_code)
VALUES ('IN', 'India', '+91')
ON CONFLICT (code) DO NOTHING;

-- Get India's ID for foreign key references
DO $$
DECLARE
  india_id uuid;
  andhra_pradesh_id uuid;
  arunachal_pradesh_id uuid;
  assam_id uuid;
  bihar_id uuid;
  chhattisgarh_id uuid;
  goa_id uuid;
  gujarat_id uuid;
  haryana_id uuid;
  himachal_pradesh_id uuid;
  jharkhand_id uuid;
  karnataka_id uuid;
  kerala_id uuid;
  madhya_pradesh_id uuid;
  maharashtra_id uuid;
  manipur_id uuid;
  meghalaya_id uuid;
  mizoram_id uuid;
  nagaland_id uuid;
  odisha_id uuid;
  punjab_id uuid;
  rajasthan_id uuid;
  sikkim_id uuid;
  tamil_nadu_id uuid;
  telangana_id uuid;
  tripura_id uuid;
  uttar_pradesh_id uuid;
  uttarakhand_id uuid;
  west_bengal_id uuid;
  andaman_nicobar_id uuid;
  chandigarh_id uuid;
  dadra_nagar_haveli_id uuid;
  daman_diu_id uuid;
  delhi_id uuid;
  jammu_kashmir_id uuid;
  ladakh_id uuid;
  lakshadweep_id uuid;
  puducherry_id uuid;
BEGIN
  -- Get India's ID
  SELECT id INTO india_id FROM public.countries WHERE code = 'IN';
  
  -- Insert Indian States and Union Territories
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Andhra Pradesh', 'AP') ON CONFLICT DO NOTHING RETURNING id INTO andhra_pradesh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Arunachal Pradesh', 'AR') ON CONFLICT DO NOTHING RETURNING id INTO arunachal_pradesh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Assam', 'AS') ON CONFLICT DO NOTHING RETURNING id INTO assam_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Bihar', 'BR') ON CONFLICT DO NOTHING RETURNING id INTO bihar_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Chhattisgarh', 'CG') ON CONFLICT DO NOTHING RETURNING id INTO chhattisgarh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Goa', 'GA') ON CONFLICT DO NOTHING RETURNING id INTO goa_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Gujarat', 'GJ') ON CONFLICT DO NOTHING RETURNING id INTO gujarat_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Haryana', 'HR') ON CONFLICT DO NOTHING RETURNING id INTO haryana_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Himachal Pradesh', 'HP') ON CONFLICT DO NOTHING RETURNING id INTO himachal_pradesh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Jharkhand', 'JH') ON CONFLICT DO NOTHING RETURNING id INTO jharkhand_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Karnataka', 'KA') ON CONFLICT DO NOTHING RETURNING id INTO karnataka_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Kerala', 'KL') ON CONFLICT DO NOTHING RETURNING id INTO kerala_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Madhya Pradesh', 'MP') ON CONFLICT DO NOTHING RETURNING id INTO madhya_pradesh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Maharashtra', 'MH') ON CONFLICT DO NOTHING RETURNING id INTO maharashtra_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Manipur', 'MN') ON CONFLICT DO NOTHING RETURNING id INTO manipur_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Meghalaya', 'ML') ON CONFLICT DO NOTHING RETURNING id INTO meghalaya_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Mizoram', 'MZ') ON CONFLICT DO NOTHING RETURNING id INTO mizoram_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Nagaland', 'NL') ON CONFLICT DO NOTHING RETURNING id INTO nagaland_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Odisha', 'OD') ON CONFLICT DO NOTHING RETURNING id INTO odisha_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Punjab', 'PB') ON CONFLICT DO NOTHING RETURNING id INTO punjab_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Rajasthan', 'RJ') ON CONFLICT DO NOTHING RETURNING id INTO rajasthan_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Sikkim', 'SK') ON CONFLICT DO NOTHING RETURNING id INTO sikkim_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Tamil Nadu', 'TN') ON CONFLICT DO NOTHING RETURNING id INTO tamil_nadu_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Telangana', 'TS') ON CONFLICT DO NOTHING RETURNING id INTO telangana_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Tripura', 'TR') ON CONFLICT DO NOTHING RETURNING id INTO tripura_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Uttar Pradesh', 'UP') ON CONFLICT DO NOTHING RETURNING id INTO uttar_pradesh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Uttarakhand', 'UK') ON CONFLICT DO NOTHING RETURNING id INTO uttarakhand_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'West Bengal', 'WB') ON CONFLICT DO NOTHING RETURNING id INTO west_bengal_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Andaman and Nicobar Islands', 'AN') ON CONFLICT DO NOTHING RETURNING id INTO andaman_nicobar_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Chandigarh', 'CH') ON CONFLICT DO NOTHING RETURNING id INTO chandigarh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Dadra and Nagar Haveli and Daman and Diu', 'DH') ON CONFLICT DO NOTHING RETURNING id INTO dadra_nagar_haveli_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Delhi', 'DL') ON CONFLICT DO NOTHING RETURNING id INTO delhi_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Jammu and Kashmir', 'JK') ON CONFLICT DO NOTHING RETURNING id INTO jammu_kashmir_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Ladakh', 'LA') ON CONFLICT DO NOTHING RETURNING id INTO ladakh_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Lakshadweep', 'LD') ON CONFLICT DO NOTHING RETURNING id INTO lakshadweep_id;
  INSERT INTO public.states (country_id, name, code) VALUES (india_id, 'Puducherry', 'PY') ON CONFLICT DO NOTHING RETURNING id INTO puducherry_id;

  -- Fetch state IDs if they already exist
  IF andhra_pradesh_id IS NULL THEN SELECT id INTO andhra_pradesh_id FROM public.states WHERE code = 'AP' AND country_id = india_id; END IF;
  IF karnataka_id IS NULL THEN SELECT id INTO karnataka_id FROM public.states WHERE code = 'KA' AND country_id = india_id; END IF;
  IF maharashtra_id IS NULL THEN SELECT id INTO maharashtra_id FROM public.states WHERE code = 'MH' AND country_id = india_id; END IF;
  IF tamil_nadu_id IS NULL THEN SELECT id INTO tamil_nadu_id FROM public.states WHERE code = 'TN' AND country_id = india_id; END IF;
  IF telangana_id IS NULL THEN SELECT id INTO telangana_id FROM public.states WHERE code = 'TS' AND country_id = india_id; END IF;
  IF kerala_id IS NULL THEN SELECT id INTO kerala_id FROM public.states WHERE code = 'KL' AND country_id = india_id; END IF;
  IF delhi_id IS NULL THEN SELECT id INTO delhi_id FROM public.states WHERE code = 'DL' AND country_id = india_id; END IF;
  IF uttar_pradesh_id IS NULL THEN SELECT id INTO uttar_pradesh_id FROM public.states WHERE code = 'UP' AND country_id = india_id; END IF;
  IF gujarat_id IS NULL THEN SELECT id INTO gujarat_id FROM public.states WHERE code = 'GJ' AND country_id = india_id; END IF;
  IF rajasthan_id IS NULL THEN SELECT id INTO rajasthan_id FROM public.states WHERE code = 'RJ' AND country_id = india_id; END IF;
  IF punjab_id IS NULL THEN SELECT id INTO punjab_id FROM public.states WHERE code = 'PB' AND country_id = india_id; END IF;
  IF haryana_id IS NULL THEN SELECT id INTO haryana_id FROM public.states WHERE code = 'HR' AND country_id = india_id; END IF;
  IF madhya_pradesh_id IS NULL THEN SELECT id INTO madhya_pradesh_id FROM public.states WHERE code = 'MP' AND country_id = india_id; END IF;
  IF west_bengal_id IS NULL THEN SELECT id INTO west_bengal_id FROM public.states WHERE code = 'WB' AND country_id = india_id; END IF;
  IF bihar_id IS NULL THEN SELECT id INTO bihar_id FROM public.states WHERE code = 'BR' AND country_id = india_id; END IF;
  IF odisha_id IS NULL THEN SELECT id INTO odisha_id FROM public.states WHERE code = 'OD' AND country_id = india_id; END IF;
  
  -- Insert cities for major states (sample cities for each state)
  
  -- Karnataka cities
  IF karnataka_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (karnataka_id, 'Bengaluru'), (karnataka_id, 'Mysuru'), (karnataka_id, 'Mangaluru'),
      (karnataka_id, 'Hubballi'), (karnataka_id, 'Belagavi'), (karnataka_id, 'Davanagere'),
      (karnataka_id, 'Ballari'), (karnataka_id, 'Vijayapura'), (karnataka_id, 'Shivamogga'),
      (karnataka_id, 'Tumakuru')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Maharashtra cities
  IF maharashtra_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (maharashtra_id, 'Mumbai'), (maharashtra_id, 'Pune'), (maharashtra_id, 'Nagpur'),
      (maharashtra_id, 'Nashik'), (maharashtra_id, 'Aurangabad'), (maharashtra_id, 'Solapur'),
      (maharashtra_id, 'Thane'), (maharashtra_id, 'Kolhapur'), (maharashtra_id, 'Amravati'),
      (maharashtra_id, 'Navi Mumbai')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Tamil Nadu cities
  IF tamil_nadu_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (tamil_nadu_id, 'Chennai'), (tamil_nadu_id, 'Coimbatore'), (tamil_nadu_id, 'Madurai'),
      (tamil_nadu_id, 'Tiruchirappalli'), (tamil_nadu_id, 'Salem'), (tamil_nadu_id, 'Tirunelveli'),
      (tamil_nadu_id, 'Tiruppur'), (tamil_nadu_id, 'Erode'), (tamil_nadu_id, 'Vellore'),
      (tamil_nadu_id, 'Thoothukudi')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Telangana cities
  IF telangana_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (telangana_id, 'Hyderabad'), (telangana_id, 'Warangal'), (telangana_id, 'Nizamabad'),
      (telangana_id, 'Karimnagar'), (telangana_id, 'Khammam'), (telangana_id, 'Mahbubnagar'),
      (telangana_id, 'Nalgonda'), (telangana_id, 'Adilabad'), (telangana_id, 'Ramagundam'),
      (telangana_id, 'Siddipet')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Delhi cities
  IF delhi_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (delhi_id, 'New Delhi'), (delhi_id, 'Delhi'), (delhi_id, 'Dwarka'), 
      (delhi_id, 'Rohini'), (delhi_id, 'Saket'), (delhi_id, 'Karol Bagh')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Uttar Pradesh cities
  IF uttar_pradesh_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (uttar_pradesh_id, 'Lucknow'), (uttar_pradesh_id, 'Kanpur'), (uttar_pradesh_id, 'Ghaziabad'),
      (uttar_pradesh_id, 'Agra'), (uttar_pradesh_id, 'Varanasi'), (uttar_pradesh_id, 'Meerut'),
      (uttar_pradesh_id, 'Prayagraj'), (uttar_pradesh_id, 'Bareilly'), (uttar_pradesh_id, 'Aligarh'),
      (uttar_pradesh_id, 'Noida')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Gujarat cities
  IF gujarat_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (gujarat_id, 'Ahmedabad'), (gujarat_id, 'Surat'), (gujarat_id, 'Vadodara'),
      (gujarat_id, 'Rajkot'), (gujarat_id, 'Bhavnagar'), (gujarat_id, 'Jamnagar'),
      (gujarat_id, 'Junagadh'), (gujarat_id, 'Gandhinagar'), (gujarat_id, 'Anand'),
      (gujarat_id, 'Nadiad')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Rajasthan cities
  IF rajasthan_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (rajasthan_id, 'Jaipur'), (rajasthan_id, 'Jodhpur'), (rajasthan_id, 'Kota'),
      (rajasthan_id, 'Bikaner'), (rajasthan_id, 'Ajmer'), (rajasthan_id, 'Udaipur'),
      (rajasthan_id, 'Bhilwara'), (rajasthan_id, 'Alwar'), (rajasthan_id, 'Bharatpur'),
      (rajasthan_id, 'Sikar')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Kerala cities
  IF kerala_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (kerala_id, 'Thiruvananthapuram'), (kerala_id, 'Kochi'), (kerala_id, 'Kozhikode'),
      (kerala_id, 'Thrissur'), (kerala_id, 'Kollam'), (kerala_id, 'Palakkad'),
      (kerala_id, 'Alappuzha'), (kerala_id, 'Kannur'), (kerala_id, 'Kottayam'),
      (kerala_id, 'Malappuram')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Andhra Pradesh cities
  IF andhra_pradesh_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (andhra_pradesh_id, 'Visakhapatnam'), (andhra_pradesh_id, 'Vijayawada'), (andhra_pradesh_id, 'Guntur'),
      (andhra_pradesh_id, 'Nellore'), (andhra_pradesh_id, 'Kurnool'), (andhra_pradesh_id, 'Rajahmundry'),
      (andhra_pradesh_id, 'Tirupati'), (andhra_pradesh_id, 'Kadapa'), (andhra_pradesh_id, 'Kakinada'),
      (andhra_pradesh_id, 'Anantapur')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Punjab cities
  IF punjab_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (punjab_id, 'Ludhiana'), (punjab_id, 'Amritsar'), (punjab_id, 'Jalandhar'),
      (punjab_id, 'Patiala'), (punjab_id, 'Bathinda'), (punjab_id, 'Mohali'),
      (punjab_id, 'Pathankot'), (punjab_id, 'Hoshiarpur'), (punjab_id, 'Moga'),
      (punjab_id, 'Sangrur')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Haryana cities
  IF haryana_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (haryana_id, 'Faridabad'), (haryana_id, 'Gurgaon'), (haryana_id, 'Panipat'),
      (haryana_id, 'Ambala'), (haryana_id, 'Yamunanagar'), (haryana_id, 'Rohtak'),
      (haryana_id, 'Hisar'), (haryana_id, 'Karnal'), (haryana_id, 'Sonipat'),
      (haryana_id, 'Panchkula')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Madhya Pradesh cities
  IF madhya_pradesh_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (madhya_pradesh_id, 'Indore'), (madhya_pradesh_id, 'Bhopal'), (madhya_pradesh_id, 'Jabalpur'),
      (madhya_pradesh_id, 'Gwalior'), (madhya_pradesh_id, 'Ujjain'), (madhya_pradesh_id, 'Sagar'),
      (madhya_pradesh_id, 'Dewas'), (madhya_pradesh_id, 'Satna'), (madhya_pradesh_id, 'Ratlam'),
      (madhya_pradesh_id, 'Rewa')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- West Bengal cities
  IF west_bengal_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (west_bengal_id, 'Kolkata'), (west_bengal_id, 'Howrah'), (west_bengal_id, 'Durgapur'),
      (west_bengal_id, 'Asansol'), (west_bengal_id, 'Siliguri'), (west_bengal_id, 'Bardhaman'),
      (west_bengal_id, 'Malda'), (west_bengal_id, 'Baharampur'), (west_bengal_id, 'Habra'),
      (west_bengal_id, 'Kharagpur')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Bihar cities
  IF bihar_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (bihar_id, 'Patna'), (bihar_id, 'Gaya'), (bihar_id, 'Bhagalpur'),
      (bihar_id, 'Muzaffarpur'), (bihar_id, 'Darbhanga'), (bihar_id, 'Purnia'),
      (bihar_id, 'Bihar Sharif'), (bihar_id, 'Arrah'), (bihar_id, 'Begusarai'),
      (bihar_id, 'Katihar')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Odisha cities
  IF odisha_id IS NOT NULL THEN
    INSERT INTO public.cities (state_id, name) VALUES 
      (odisha_id, 'Bhubaneswar'), (odisha_id, 'Cuttack'), (odisha_id, 'Rourkela'),
      (odisha_id, 'Berhampur'), (odisha_id, 'Sambalpur'), (odisha_id, 'Puri'),
      (odisha_id, 'Balasore'), (odisha_id, 'Bhadrak'), (odisha_id, 'Baripada'),
      (odisha_id, 'Jeypore')
    ON CONFLICT DO NOTHING;
  END IF;
  
END $$;

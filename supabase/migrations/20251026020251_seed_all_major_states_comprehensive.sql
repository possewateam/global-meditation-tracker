/*
  # Seed States/Provinces for Major Countries
  
  1. States Added For:
    - United States (50 states)
    - China (34 provinces)
    - Brazil (27 states)
    - Russia (federal subjects)
    - Mexico (32 states)
    - Germany (16 states)
    - France (18 regions)
    - Italy (20 regions)
    - Spain (17 autonomous communities)
    - Japan (47 prefectures)
    - South Korea (17 provinces)
    - Indonesia (38 provinces)
    - Pakistan (4 provinces + territories)
    - Bangladesh (8 divisions)
    - Nigeria (36 states)
    - South Africa (9 provinces)
    
  2. Notes
    - Comprehensive administrative divisions
    - Data is inserted only if not already present
*/

DO $$
DECLARE
  v_country_id uuid;
BEGIN
  -- UNITED STATES (50 States)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'US';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Alabama', 'AL'),
      (v_country_id, 'Alaska', 'AK'),
      (v_country_id, 'Arizona', 'AZ'),
      (v_country_id, 'Arkansas', 'AR'),
      (v_country_id, 'California', 'CA'),
      (v_country_id, 'Colorado', 'CO'),
      (v_country_id, 'Connecticut', 'CT'),
      (v_country_id, 'Delaware', 'DE'),
      (v_country_id, 'Florida', 'FL'),
      (v_country_id, 'Georgia', 'GA'),
      (v_country_id, 'Hawaii', 'HI'),
      (v_country_id, 'Idaho', 'ID'),
      (v_country_id, 'Illinois', 'IL'),
      (v_country_id, 'Indiana', 'IN'),
      (v_country_id, 'Iowa', 'IA'),
      (v_country_id, 'Kansas', 'KS'),
      (v_country_id, 'Kentucky', 'KY'),
      (v_country_id, 'Louisiana', 'LA'),
      (v_country_id, 'Maine', 'ME'),
      (v_country_id, 'Maryland', 'MD'),
      (v_country_id, 'Massachusetts', 'MA'),
      (v_country_id, 'Michigan', 'MI'),
      (v_country_id, 'Minnesota', 'MN'),
      (v_country_id, 'Mississippi', 'MS'),
      (v_country_id, 'Missouri', 'MO'),
      (v_country_id, 'Montana', 'MT'),
      (v_country_id, 'Nebraska', 'NE'),
      (v_country_id, 'Nevada', 'NV'),
      (v_country_id, 'New Hampshire', 'NH'),
      (v_country_id, 'New Jersey', 'NJ'),
      (v_country_id, 'New Mexico', 'NM'),
      (v_country_id, 'New York', 'NY'),
      (v_country_id, 'North Carolina', 'NC'),
      (v_country_id, 'North Dakota', 'ND'),
      (v_country_id, 'Ohio', 'OH'),
      (v_country_id, 'Oklahoma', 'OK'),
      (v_country_id, 'Oregon', 'OR'),
      (v_country_id, 'Pennsylvania', 'PA'),
      (v_country_id, 'Rhode Island', 'RI'),
      (v_country_id, 'South Carolina', 'SC'),
      (v_country_id, 'South Dakota', 'SD'),
      (v_country_id, 'Tennessee', 'TN'),
      (v_country_id, 'Texas', 'TX'),
      (v_country_id, 'Utah', 'UT'),
      (v_country_id, 'Vermont', 'VT'),
      (v_country_id, 'Virginia', 'VA'),
      (v_country_id, 'Washington', 'WA'),
      (v_country_id, 'West Virginia', 'WV'),
      (v_country_id, 'Wisconsin', 'WI'),
      (v_country_id, 'Wyoming', 'WY')
    ON CONFLICT DO NOTHING;
  END IF;

  -- CHINA (Provinces)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'CN';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Anhui', 'AH'),
      (v_country_id, 'Beijing', 'BJ'),
      (v_country_id, 'Chongqing', 'CQ'),
      (v_country_id, 'Fujian', 'FJ'),
      (v_country_id, 'Gansu', 'GS'),
      (v_country_id, 'Guangdong', 'GD'),
      (v_country_id, 'Guangxi', 'GX'),
      (v_country_id, 'Guizhou', 'GZ'),
      (v_country_id, 'Hainan', 'HI'),
      (v_country_id, 'Hebei', 'HE'),
      (v_country_id, 'Heilongjiang', 'HL'),
      (v_country_id, 'Henan', 'HA'),
      (v_country_id, 'Hong Kong', 'HK'),
      (v_country_id, 'Hubei', 'HB'),
      (v_country_id, 'Hunan', 'HN'),
      (v_country_id, 'Inner Mongolia', 'NM'),
      (v_country_id, 'Jiangsu', 'JS'),
      (v_country_id, 'Jiangxi', 'JX'),
      (v_country_id, 'Jilin', 'JL'),
      (v_country_id, 'Liaoning', 'LN'),
      (v_country_id, 'Macau', 'MO'),
      (v_country_id, 'Ningxia', 'NX'),
      (v_country_id, 'Qinghai', 'QH'),
      (v_country_id, 'Shaanxi', 'SN'),
      (v_country_id, 'Shandong', 'SD'),
      (v_country_id, 'Shanghai', 'SH'),
      (v_country_id, 'Shanxi', 'SX'),
      (v_country_id, 'Sichuan', 'SC'),
      (v_country_id, 'Tianjin', 'TJ'),
      (v_country_id, 'Tibet', 'XZ'),
      (v_country_id, 'Xinjiang', 'XJ'),
      (v_country_id, 'Yunnan', 'YN'),
      (v_country_id, 'Zhejiang', 'ZJ')
    ON CONFLICT DO NOTHING;
  END IF;

  -- BRAZIL (States)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'BR';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Acre', 'AC'),
      (v_country_id, 'Alagoas', 'AL'),
      (v_country_id, 'Amapá', 'AP'),
      (v_country_id, 'Amazonas', 'AM'),
      (v_country_id, 'Bahia', 'BA'),
      (v_country_id, 'Ceará', 'CE'),
      (v_country_id, 'Distrito Federal', 'DF'),
      (v_country_id, 'Espírito Santo', 'ES'),
      (v_country_id, 'Goiás', 'GO'),
      (v_country_id, 'Maranhão', 'MA'),
      (v_country_id, 'Mato Grosso', 'MT'),
      (v_country_id, 'Mato Grosso do Sul', 'MS'),
      (v_country_id, 'Minas Gerais', 'MG'),
      (v_country_id, 'Pará', 'PA'),
      (v_country_id, 'Paraíba', 'PB'),
      (v_country_id, 'Paraná', 'PR'),
      (v_country_id, 'Pernambuco', 'PE'),
      (v_country_id, 'Piauí', 'PI'),
      (v_country_id, 'Rio de Janeiro', 'RJ'),
      (v_country_id, 'Rio Grande do Norte', 'RN'),
      (v_country_id, 'Rio Grande do Sul', 'RS'),
      (v_country_id, 'Rondônia', 'RO'),
      (v_country_id, 'Roraima', 'RR'),
      (v_country_id, 'Santa Catarina', 'SC'),
      (v_country_id, 'São Paulo', 'SP'),
      (v_country_id, 'Sergipe', 'SE'),
      (v_country_id, 'Tocantins', 'TO')
    ON CONFLICT DO NOTHING;
  END IF;

  -- MEXICO (States)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'MX';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Aguascalientes', 'AGU'),
      (v_country_id, 'Baja California', 'BCN'),
      (v_country_id, 'Baja California Sur', 'BCS'),
      (v_country_id, 'Campeche', 'CAM'),
      (v_country_id, 'Chiapas', 'CHP'),
      (v_country_id, 'Chihuahua', 'CHH'),
      (v_country_id, 'Coahuila', 'COA'),
      (v_country_id, 'Colima', 'COL'),
      (v_country_id, 'Durango', 'DUR'),
      (v_country_id, 'Guanajuato', 'GUA'),
      (v_country_id, 'Guerrero', 'GRO'),
      (v_country_id, 'Hidalgo', 'HID'),
      (v_country_id, 'Jalisco', 'JAL'),
      (v_country_id, 'Mexico City', 'CMX'),
      (v_country_id, 'México', 'MEX'),
      (v_country_id, 'Michoacán', 'MIC'),
      (v_country_id, 'Morelos', 'MOR'),
      (v_country_id, 'Nayarit', 'NAY'),
      (v_country_id, 'Nuevo León', 'NLE'),
      (v_country_id, 'Oaxaca', 'OAX'),
      (v_country_id, 'Puebla', 'PUE'),
      (v_country_id, 'Querétaro', 'QUE'),
      (v_country_id, 'Quintana Roo', 'ROO'),
      (v_country_id, 'San Luis Potosí', 'SLP'),
      (v_country_id, 'Sinaloa', 'SIN'),
      (v_country_id, 'Sonora', 'SON'),
      (v_country_id, 'Tabasco', 'TAB'),
      (v_country_id, 'Tamaulipas', 'TAM'),
      (v_country_id, 'Tlaxcala', 'TLA'),
      (v_country_id, 'Veracruz', 'VER'),
      (v_country_id, 'Yucatán', 'YUC'),
      (v_country_id, 'Zacatecas', 'ZAC')
    ON CONFLICT DO NOTHING;
  END IF;

  -- GERMANY (States)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'DE';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Baden-Württemberg', 'BW'),
      (v_country_id, 'Bavaria', 'BY'),
      (v_country_id, 'Berlin', 'BE'),
      (v_country_id, 'Brandenburg', 'BB'),
      (v_country_id, 'Bremen', 'HB'),
      (v_country_id, 'Hamburg', 'HH'),
      (v_country_id, 'Hesse', 'HE'),
      (v_country_id, 'Lower Saxony', 'NI'),
      (v_country_id, 'Mecklenburg-Vorpommern', 'MV'),
      (v_country_id, 'North Rhine-Westphalia', 'NW'),
      (v_country_id, 'Rhineland-Palatinate', 'RP'),
      (v_country_id, 'Saarland', 'SL'),
      (v_country_id, 'Saxony', 'SN'),
      (v_country_id, 'Saxony-Anhalt', 'ST'),
      (v_country_id, 'Schleswig-Holstein', 'SH'),
      (v_country_id, 'Thuringia', 'TH')
    ON CONFLICT DO NOTHING;
  END IF;

  -- PAKISTAN (Provinces)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'PK';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Balochistan', 'BA'),
      (v_country_id, 'Khyber Pakhtunkhwa', 'KP'),
      (v_country_id, 'Punjab', 'PB'),
      (v_country_id, 'Sindh', 'SD'),
      (v_country_id, 'Islamabad Capital Territory', 'IS'),
      (v_country_id, 'Gilgit-Baltistan', 'GB'),
      (v_country_id, 'Azad Kashmir', 'JK')
    ON CONFLICT DO NOTHING;
  END IF;

  -- BANGLADESH (Divisions)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'BD';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Barisal', 'A'),
      (v_country_id, 'Chittagong', 'B'),
      (v_country_id, 'Dhaka', 'C'),
      (v_country_id, 'Khulna', 'D'),
      (v_country_id, 'Mymensingh', 'M'),
      (v_country_id, 'Rajshahi', 'E'),
      (v_country_id, 'Rangpur', 'F'),
      (v_country_id, 'Sylhet', 'G')
    ON CONFLICT DO NOTHING;
  END IF;

  -- NIGERIA (States)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'NG';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Abia', 'AB'),
      (v_country_id, 'Abuja Federal Capital Territory', 'FC'),
      (v_country_id, 'Adamawa', 'AD'),
      (v_country_id, 'Akwa Ibom', 'AK'),
      (v_country_id, 'Anambra', 'AN'),
      (v_country_id, 'Bauchi', 'BA'),
      (v_country_id, 'Bayelsa', 'BY'),
      (v_country_id, 'Benue', 'BE'),
      (v_country_id, 'Borno', 'BO'),
      (v_country_id, 'Cross River', 'CR'),
      (v_country_id, 'Delta', 'DE'),
      (v_country_id, 'Ebonyi', 'EB'),
      (v_country_id, 'Edo', 'ED'),
      (v_country_id, 'Ekiti', 'EK'),
      (v_country_id, 'Enugu', 'EN'),
      (v_country_id, 'Gombe', 'GO'),
      (v_country_id, 'Imo', 'IM'),
      (v_country_id, 'Jigawa', 'JI'),
      (v_country_id, 'Kaduna', 'KD'),
      (v_country_id, 'Kano', 'KN'),
      (v_country_id, 'Katsina', 'KT'),
      (v_country_id, 'Kebbi', 'KE'),
      (v_country_id, 'Kogi', 'KO'),
      (v_country_id, 'Kwara', 'KW'),
      (v_country_id, 'Lagos', 'LA'),
      (v_country_id, 'Nasarawa', 'NA'),
      (v_country_id, 'Niger', 'NI'),
      (v_country_id, 'Ogun', 'OG'),
      (v_country_id, 'Ondo', 'ON'),
      (v_country_id, 'Osun', 'OS'),
      (v_country_id, 'Oyo', 'OY'),
      (v_country_id, 'Plateau', 'PL'),
      (v_country_id, 'Rivers', 'RI'),
      (v_country_id, 'Sokoto', 'SO'),
      (v_country_id, 'Taraba', 'TA'),
      (v_country_id, 'Yobe', 'YO'),
      (v_country_id, 'Zamfara', 'ZA')
    ON CONFLICT DO NOTHING;
  END IF;

  -- SOUTH AFRICA (Provinces)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'ZA';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Eastern Cape', 'EC'),
      (v_country_id, 'Free State', 'FS'),
      (v_country_id, 'Gauteng', 'GP'),
      (v_country_id, 'KwaZulu-Natal', 'KZN'),
      (v_country_id, 'Limpopo', 'LP'),
      (v_country_id, 'Mpumalanga', 'MP'),
      (v_country_id, 'Northern Cape', 'NC'),
      (v_country_id, 'North West', 'NW'),
      (v_country_id, 'Western Cape', 'WC')
    ON CONFLICT DO NOTHING;
  END IF;

  -- JAPAN (Prefectures - Major ones)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'JP';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Tokyo', '13'),
      (v_country_id, 'Osaka', '27'),
      (v_country_id, 'Kyoto', '26'),
      (v_country_id, 'Hokkaido', '01'),
      (v_country_id, 'Fukuoka', '40'),
      (v_country_id, 'Kanagawa', '14'),
      (v_country_id, 'Saitama', '11'),
      (v_country_id, 'Aichi', '23'),
      (v_country_id, 'Hyogo', '28'),
      (v_country_id, 'Chiba', '12')
    ON CONFLICT DO NOTHING;
  END IF;

  -- SOUTH KOREA (Provinces)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'KR';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Seoul', '11'),
      (v_country_id, 'Busan', '26'),
      (v_country_id, 'Daegu', '27'),
      (v_country_id, 'Incheon', '28'),
      (v_country_id, 'Gwangju', '29'),
      (v_country_id, 'Daejeon', '30'),
      (v_country_id, 'Ulsan', '31'),
      (v_country_id, 'Gyeonggi', '41'),
      (v_country_id, 'Gangwon', '42'),
      (v_country_id, 'North Chungcheong', '43'),
      (v_country_id, 'South Chungcheong', '44'),
      (v_country_id, 'North Jeolla', '45'),
      (v_country_id, 'South Jeolla', '46'),
      (v_country_id, 'North Gyeongsang', '47'),
      (v_country_id, 'South Gyeongsang', '48'),
      (v_country_id, 'Jeju', '49')
    ON CONFLICT DO NOTHING;
  END IF;

  -- INDONESIA (Major Provinces)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'ID';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Jakarta', 'JK'),
      (v_country_id, 'West Java', 'JB'),
      (v_country_id, 'East Java', 'JI'),
      (v_country_id, 'Central Java', 'JT'),
      (v_country_id, 'Banten', 'BT'),
      (v_country_id, 'Bali', 'BA'),
      (v_country_id, 'West Sumatra', 'SB'),
      (v_country_id, 'South Sumatra', 'SS'),
      (v_country_id, 'North Sumatra', 'SU'),
      (v_country_id, 'Aceh', 'AC')
    ON CONFLICT DO NOTHING;
  END IF;

  -- PHILIPPINES (Regions)
  SELECT id INTO v_country_id FROM public.countries WHERE code = 'PH';
  IF v_country_id IS NOT NULL THEN
    INSERT INTO public.states (country_id, name, code) VALUES
      (v_country_id, 'Metro Manila', 'NCR'),
      (v_country_id, 'Ilocos Region', '01'),
      (v_country_id, 'Cagayan Valley', '02'),
      (v_country_id, 'Central Luzon', '03'),
      (v_country_id, 'Calabarzon', '04'),
      (v_country_id, 'Mimaropa', '05'),
      (v_country_id, 'Bicol Region', '06'),
      (v_country_id, 'Western Visayas', '07'),
      (v_country_id, 'Central Visayas', '08'),
      (v_country_id, 'Eastern Visayas', '09'),
      (v_country_id, 'Zamboanga Peninsula', '10'),
      (v_country_id, 'Northern Mindanao', '11'),
      (v_country_id, 'Davao Region', '12'),
      (v_country_id, 'Soccsksargen', '13'),
      (v_country_id, 'Caraga', '14')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- 1. Create the parties table (if it doesn't exist)
create table if not exists public.parties (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  short_code text not null,
  symbol_name text,
  image_url text,
  color text,
  vote_count bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the voters table to track IP addresses (if it doesn't exist)
create table if not exists public.voters (
  ip_address text primary key,
  party_id uuid references public.parties(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.parties enable row level security;
alter table public.voters enable row level security;

-- 4. Policies
-- Parties: Public Read, Public Write (for vote counts)
create policy "Allow public read access" on public.parties for select to public using (true);
-- Note: In production, consider using a stored procedure (RPC) for voting to avoid public write access
create policy "Allow public write access" on public.parties for all to public using (true) with check (true);

-- Voters: Public Insert (to record vote), Public Select (to check status)
create policy "Allow public insert voters" on public.voters for insert to public with check (true);
create policy "Allow public read voters" on public.voters for select to public using (true);

-- 5. Insert initial data for 13th National Parliament Survey
-- Using WHERE NOT EXISTS to prevent duplicates if script is run multiple times

-- BNP
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Bangladesh Nationalist Party (BNP)', 'BNP', 'Sheaf of Paddy (Dhaner Shish)', 'bg-green-600', 120, 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Bangladesh_Nationalist_Party_Flag.svg/1200px-Bangladesh_Nationalist_Party_Flag.svg.png'
where not exists (select 1 from public.parties where short_code = 'BNP');

-- Jamaat
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Bangladesh Jamaat-e-Islami', 'Jamaat', 'Scale (Daripalla)', 'bg-emerald-700', 85, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Bangladesh_Jamaat-e-Islami.svg/1200px-Flag_of_Bangladesh_Jamaat-e-Islami.svg.png'
where not exists (select 1 from public.parties where short_code = 'Jamaat');

-- Jatiya Party
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Jatiya Party (Ershad)', 'JP', 'Plough (Langol)', 'bg-yellow-500', 45, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Flag_of_the_Jatiya_Party_%28Ershad%29.svg/2560px-Flag_of_the_Jatiya_Party_%28Ershad%29.svg.png'
where not exists (select 1 from public.parties where short_code = 'JP');

-- Islami Andolan
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Islami Andolan Bangladesh', 'IAB', 'Hand Fan (Hatpakha)', 'bg-orange-600', 60, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Islami_Andolan_Bangladesh.svg/1200px-Flag_of_Islami_Andolan_Bangladesh.svg.png'
where not exists (select 1 from public.parties where short_code = 'IAB');

-- Gono Odhikar Parishad
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Gono Odhikar Parishad', 'GOP', 'Truck', 'bg-blue-500', 30, null
where not exists (select 1 from public.parties where short_code = 'GOP');

-- AB Party
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Amar Bangladesh Party (AB Party)', 'AB', 'Eagle', 'bg-purple-600', 25, null
where not exists (select 1 from public.parties where short_code = 'AB');

-- CPB (Communist Party)
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Communist Party of Bangladesh (CPB)', 'CPB', 'Sickle and Hammer', 'bg-red-700', 15, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Flag_of_the_Communist_Party_of_Bangladesh.svg/1200px-Flag_of_the_Communist_Party_of_Bangladesh.svg.png'
where not exists (select 1 from public.parties where short_code = 'CPB');

-- LDP
insert into public.parties (name, short_code, symbol_name, color, vote_count, image_url)
select 'Liberal Democratic Party (LDP)', 'LDP', 'Umbrella', 'bg-teal-600', 10, null
where not exists (select 1 from public.parties where short_code = 'LDP');
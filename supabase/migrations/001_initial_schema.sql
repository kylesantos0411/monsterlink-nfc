-- MONSTERLINK DATABASE SCHEMA
-- PostgreSQL with Supabase Row Level Security (RLS)

-- 1. Profiles Table (Optional auth linkage)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Registered NFC Tags Table
-- Prevents duplicate card registrations across players or profiles
CREATE TABLE IF NOT EXISTS public.registered_tags (
  card_code TEXT PRIMARY KEY,
  species_id TEXT NOT NULL,
  registered_by UUID REFERENCES auth.users ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Collected Creatures Table
CREATE TABLE IF NOT EXISTS public.creatures (
  instance_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  species_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  level INT DEFAULT 5,
  max_hp INT NOT NULL,
  current_hp INT NOT NULL,
  attack INT NOT NULL,
  defense INT NOT NULL,
  speed INT NOT NULL,
  known_moves JSONB NOT NULL DEFAULT '[]'::jsonb,
  nfc_card_code TEXT REFERENCES public.registered_tags(card_code) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Battle History Records Table
CREATE TABLE IF NOT EXISTS public.battle_records (
  record_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  player_creature JSONB NOT NULL,
  opponent_creature JSONB NOT NULL,
  turn_count INT NOT NULL,
  moves_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner_name TEXT,
  loser_name TEXT,
  outcome TEXT NOT NULL, -- 'Victory', 'Defeat', 'Aborted'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security Policies (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_records ENABLE ROW LEVEL SECURITY;

-- Read/Write policies for authenticated users
CREATE POLICY "Users can view all registered tag codes"
  ON public.registered_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can register tags"
  ON public.registered_tags FOR INSERT
  WITH CHECK (auth.uid() = registered_by);

CREATE POLICY "Users can manage own creatures"
  ON public.creatures FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own battle records"
  ON public.battle_records FOR ALL
  USING (auth.uid() = user_id);

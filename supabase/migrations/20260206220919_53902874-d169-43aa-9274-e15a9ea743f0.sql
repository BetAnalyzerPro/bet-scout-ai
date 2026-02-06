-- Create bankroll_settings table
CREATE TABLE IF NOT EXISTS public.bankroll_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  banca_atual numeric(12,2) NOT NULL DEFAULT 0,
  limite_mensal_exposicao numeric(12,2),
  percentual_stake_base numeric(5,2) NOT NULL DEFAULT 1.00,
  smart_risk_adjustment boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bankroll_entries table
CREATE TABLE IF NOT EXISTS public.bankroll_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stake numeric(12,2) NOT NULL,
  odd_total numeric(10,2),
  bet_type text NOT NULL CHECK (bet_type IN ('simples', 'multipla')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'green', 'red')),
  linked_analysis_id uuid,
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high')),
  profit_loss numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bankroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bankroll_entries ENABLE ROW LEVEL SECURITY;

-- RLS for bankroll_settings
CREATE POLICY "Users can view their own settings" ON public.bankroll_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.bankroll_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.bankroll_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON public.bankroll_settings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for bankroll_entries
CREATE POLICY "Users can view their own entries" ON public.bankroll_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON public.bankroll_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON public.bankroll_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON public.bankroll_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bankroll_entries_user_created ON public.bankroll_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bankroll_entries_user_status ON public.bankroll_entries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bankroll_settings_user ON public.bankroll_settings(user_id);

-- Update trigger for bankroll_settings
CREATE TRIGGER update_bankroll_settings_updated_at
  BEFORE UPDATE ON public.bankroll_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for bankroll_entries
CREATE TRIGGER update_bankroll_entries_updated_at
  BEFORE UPDATE ON public.bankroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
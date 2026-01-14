-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum para planos
CREATE TYPE public.subscription_plan AS ENUM ('free', 'intermediate', 'advanced');

-- Enum para nível de risco
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');

-- Enum para status de análise
CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  current_plan subscription_plan NOT NULL DEFAULT 'free',
  daily_analyses_used INTEGER NOT NULL DEFAULT 0,
  last_analysis_reset DATE DEFAULT CURRENT_DATE,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuário (segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabela de análises de bilhetes
CREATE TABLE public.bet_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_image_url TEXT NOT NULL,
  extracted_data JSONB,
  analysis_result JSONB,
  overall_risk risk_level,
  status analysis_status NOT NULL DEFAULT 'pending',
  is_green BOOLEAN,
  user_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de gestão de banca (plano avançado)
CREATE TABLE public.bankroll_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  initial_bankroll DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_bankroll DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unit_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de transações de banca
CREATE TABLE public.bankroll_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.bet_analyses(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'bet', 'win', 'loss'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bankroll_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bankroll_transactions ENABLE ROW LEVEL SECURITY;

-- Função de verificação de role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies para profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies para bet_analyses
CREATE POLICY "Users can view their own analyses"
ON public.bet_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
ON public.bet_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.bet_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.bet_analyses FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para bankroll_management
CREATE POLICY "Users can view their own bankroll"
ON public.bankroll_management FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bankroll"
ON public.bankroll_management FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bankroll"
ON public.bankroll_management FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies para bankroll_transactions
CREATE POLICY "Users can view their own transactions"
ON public.bankroll_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.bankroll_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bet_analyses_updated_at
BEFORE UPDATE ON public.bet_analyses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bankroll_management_updated_at
BEFORE UPDATE ON public.bankroll_management
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para imagens de bilhetes
INSERT INTO storage.buckets (id, name, public) VALUES ('bet-tickets', 'bet-tickets', false);

-- Storage policies
CREATE POLICY "Users can upload their own tickets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bet-tickets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own tickets"
ON storage.objects FOR SELECT
USING (bucket_id = 'bet-tickets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own tickets"
ON storage.objects FOR DELETE
USING (bucket_id = 'bet-tickets' AND auth.uid()::text = (storage.foldername(name))[1]);
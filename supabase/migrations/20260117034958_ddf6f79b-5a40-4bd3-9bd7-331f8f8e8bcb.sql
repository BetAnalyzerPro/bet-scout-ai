-- Create table for learning feedback (completed bets with results)
CREATE TABLE public.learning_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_id UUID REFERENCES public.bet_analyses(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('green', 'red')),
  match_info JSONB,
  extracted_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own feedback"
ON public.learning_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
ON public.learning_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.learning_feedback FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.learning_feedback FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_learning_feedback_updated_at
BEFORE UPDATE ON public.learning_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
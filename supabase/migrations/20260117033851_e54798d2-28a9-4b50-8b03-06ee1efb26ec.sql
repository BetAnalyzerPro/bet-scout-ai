-- Add missing DELETE policy for bankroll_management table
-- This allows users to delete only their own bankroll records
CREATE POLICY "Users can delete their own bankroll"
ON public.bankroll_management FOR DELETE
USING (auth.uid() = user_id);
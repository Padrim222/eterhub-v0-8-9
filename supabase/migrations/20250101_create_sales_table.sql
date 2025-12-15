
-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    lead_id UUID REFERENCES public.leads(id),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can only see their own sales
CREATE POLICY "Users can view their own sales" ON public.sales
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create Policy: Users can insert their own sales
CREATE POLICY "Users can insert their own sales" ON public.sales
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can update their own sales
CREATE POLICY "Users can update their own sales" ON public.sales
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create Policy: Users can delete their own sales
CREATE POLICY "Users can delete their own sales" ON public.sales
    FOR DELETE
    USING (auth.uid() = user_id);

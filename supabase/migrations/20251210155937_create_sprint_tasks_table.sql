-- Create sprint_tasks table for tracking tasks within sprints
CREATE TABLE IF NOT EXISTS public.sprint_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sprint_id text NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sprint_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sprint tasks" ON public.sprint_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sprint tasks" ON public.sprint_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sprint tasks" ON public.sprint_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sprint tasks" ON public.sprint_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_user_sprint 
  ON public.sprint_tasks(user_id, sprint_id);

CREATE INDEX IF NOT EXISTS idx_sprint_tasks_user_id 
  ON public.sprint_tasks(user_id);

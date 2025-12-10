-- Corrigir search_path das funções (usando CREATE OR REPLACE sem DROP)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_engagement_rate(
  p_likes INTEGER,
  p_comments INTEGER,
  p_saves INTEGER,
  p_views INTEGER
)
RETURNS NUMERIC 
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_views IS NULL OR p_views = 0 THEN RETURN 0; END IF;
  RETURN ROUND(((COALESCE(p_likes, 0) + COALESCE(p_comments, 0) + COALESCE(p_saves, 0))::NUMERIC / p_views) * 100, 2);
END;
$$;
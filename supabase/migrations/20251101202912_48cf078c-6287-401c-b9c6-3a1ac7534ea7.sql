-- Create liked_recipes table
CREATE TABLE public.liked_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_name TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  missing_ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_history table to track all meals (homecook and dine out)
CREATE TABLE public.meal_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL, -- 'homecook' or 'dineout'
  meal_name TEXT NOT NULL,
  restaurant_name TEXT,
  expense DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.liked_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_history ENABLE ROW LEVEL SECURITY;

-- Create policies for liked_recipes
CREATE POLICY "Users can view their own liked recipes" 
ON public.liked_recipes 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own liked recipes" 
ON public.liked_recipes 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own liked recipes" 
ON public.liked_recipes 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create policies for meal_history
CREATE POLICY "Users can view their own meal history" 
ON public.meal_history 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own meal history" 
ON public.meal_history 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own meal history" 
ON public.meal_history 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own meal history" 
ON public.meal_history 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX idx_liked_recipes_user_id ON public.liked_recipes(user_id);
CREATE INDEX idx_meal_history_user_id ON public.meal_history(user_id);
CREATE INDEX idx_meal_history_created_at ON public.meal_history(created_at DESC);

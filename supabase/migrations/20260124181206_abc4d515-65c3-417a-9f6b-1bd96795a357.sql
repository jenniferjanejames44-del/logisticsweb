-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update the handle_new_user trigger to also capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  RETURN NEW;
END;
$function$;

-- Create login_history table to track device/location info
CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_type text,
  browser text,
  ip_address text,
  location text,
  logged_in_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on login_history
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for login_history
CREATE POLICY "Admins can view all login history"
ON public.login_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own login history"
ON public.login_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can delete users (we'll handle this via edge function for auth.users)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete user roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete login history
CREATE POLICY "Admins can delete login history"
ON public.login_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create shopping_orders table
CREATE TABLE public.shopping_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_link TEXT,
  item_description TEXT NOT NULL,
  item_value NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  processing_fee NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  product_image_url TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_purchase',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate order number trigger
CREATE OR REPLACE FUNCTION public.generate_shopping_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.order_number := 'RAC-SH-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_shopping_order_number_trigger
  BEFORE INSERT ON public.shopping_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_shopping_order_number();

-- Updated_at trigger
CREATE TRIGGER update_shopping_orders_updated_at
  BEFORE UPDATE ON public.shopping_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.shopping_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own shopping orders"
  ON public.shopping_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping orders"
  ON public.shopping_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping orders"
  ON public.shopping_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shopping orders"
  ON public.shopping_orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all shopping orders"
  ON public.shopping_orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shopping orders"
  ON public.shopping_orders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for shopping images
INSERT INTO storage.buckets (id, name, public) VALUES ('shopping-images', 'shopping-images', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload shopping images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shopping-images');

CREATE POLICY "Anyone can view shopping images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'shopping-images');

CREATE POLICY "Users can delete their own shopping images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'shopping-images');

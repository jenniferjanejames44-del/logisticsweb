-- Create shipment_notifications table for email subscriptions
CREATE TABLE public.shipment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tracking_number, email)
);

-- Enable Row Level Security
ALTER TABLE public.shipment_notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe to notifications (public tracking)
CREATE POLICY "Anyone can subscribe to notifications"
ON public.shipment_notifications
FOR INSERT
WITH CHECK (true);

-- Anyone can view their own subscriptions by email
CREATE POLICY "Anyone can view subscriptions by email"
ON public.shipment_notifications
FOR SELECT
USING (true);

-- Anyone can unsubscribe (update is_active)
CREATE POLICY "Anyone can update their subscriptions"
ON public.shipment_notifications
FOR UPDATE
USING (true);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications subscriptions"
ON public.shipment_notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipment_notifications_updated_at
BEFORE UPDATE ON public.shipment_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for shipments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
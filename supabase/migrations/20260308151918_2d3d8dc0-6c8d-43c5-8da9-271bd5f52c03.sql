
-- Drop all existing restrictive policies on support_tickets
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" ON public.support_tickets;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can create their own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tickets" ON public.support_tickets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix support_ticket_messages too
DROP POLICY IF EXISTS "Users can create messages on their tickets" ON public.support_ticket_messages;
DROP POLICY IF EXISTS "Users can view messages on their tickets" ON public.support_ticket_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.support_ticket_messages;
DROP POLICY IF EXISTS "Admins can create messages" ON public.support_ticket_messages;

CREATE POLICY "Users can create messages on their tickets" ON public.support_ticket_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages on their tickets" ON public.support_ticket_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Admins can view all messages" ON public.support_ticket_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create messages" ON public.support_ticket_messages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix support_ticket_attachments too
DROP POLICY IF EXISTS "Users can create attachments" ON public.support_ticket_attachments;
DROP POLICY IF EXISTS "Users can view attachments on their tickets" ON public.support_ticket_attachments;
DROP POLICY IF EXISTS "Admins can view all attachments" ON public.support_ticket_attachments;

CREATE POLICY "Users can create attachments" ON public.support_ticket_attachments FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can view attachments on their tickets" ON public.support_ticket_attachments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Admins can view all attachments" ON public.support_ticket_attachments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

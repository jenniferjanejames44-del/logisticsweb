ALTER TABLE public.email_center_messages ADD COLUMN reply_notification_emails text[];
CREATE TABLE public.email_reply_settings (id integer PRIMARY KEY DEFAULT 1, receiving_domain text NOT NULL, provider_domain_id text, enabled boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT email_reply_settings_single CHECK (id = 1));
GRANT ALL ON public.email_reply_settings TO service_role;
ALTER TABLE public.email_reply_settings ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.email_reply_threads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), original_message_id uuid REFERENCES public.email_center_messages(id) ON DELETE SET NULL, owner_id uuid NOT NULL, participant_email text NOT NULL, subject text NOT NULL, route_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE, notification_emails text[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(original_message_id, participant_email));
GRANT SELECT ON public.email_reply_threads TO authenticated;
GRANT ALL ON public.email_reply_threads TO service_role;
ALTER TABLE public.email_reply_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_reply_threads_admin_read ON public.email_reply_threads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.email_reply_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), thread_id uuid NOT NULL REFERENCES public.email_reply_threads(id) ON DELETE CASCADE, direction text NOT NULL CHECK (direction IN ('sent','received')), sender_email text NOT NULL, recipient_email text NOT NULL, subject text NOT NULL, body_text text NOT NULL DEFAULT '', body_html text NOT NULL DEFAULT '', rfc_message_id text NOT NULL UNIQUE, in_reply_to text, reference_ids text[] NOT NULL DEFAULT '{}', provider_email_id text UNIQUE, queue_message_id text UNIQUE, status text NOT NULL DEFAULT 'pending', error_message text, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.email_reply_items TO authenticated;
GRANT ALL ON public.email_reply_items TO service_role;
ALTER TABLE public.email_reply_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_reply_items_admin_read ON public.email_reply_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX email_reply_items_thread_time ON public.email_reply_items(thread_id, created_at);
CREATE TABLE public.email_reply_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES public.email_reply_items(id) ON DELETE CASCADE, recipient_email text NOT NULL, queue_message_id text NOT NULL UNIQUE, rfc_message_id text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'pending', error_message text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(item_id, recipient_email));
GRANT SELECT ON public.email_reply_notifications TO authenticated;
GRANT ALL ON public.email_reply_notifications TO service_role;
ALTER TABLE public.email_reply_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_reply_notifications_admin_read ON public.email_reply_notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.email_reply_events (provider_email_id text PRIMARY KEY, thread_id uuid REFERENCES public.email_reply_threads(id) ON DELETE SET NULL, outcome text NOT NULL, reason text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.email_reply_events TO authenticated;
GRANT ALL ON public.email_reply_events TO service_role;
ALTER TABLE public.email_reply_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_reply_events_admin_read ON public.email_reply_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.queue_email_thread_item(_thread_id uuid, _item jsonb, _payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
 INSERT INTO public.email_reply_items(thread_id,direction,sender_email,recipient_email,subject,body_text,body_html,rfc_message_id,in_reply_to,reference_ids,queue_message_id)
 VALUES(_thread_id,'sent',_item->>'sender_email',_item->>'recipient_email',_item->>'subject',coalesce(_item->>'body_text',''),coalesce(_item->>'body_html',''),_item->>'rfc_message_id',_item->>'in_reply_to',ARRAY(SELECT jsonb_array_elements_text(coalesce(_item->'reference_ids','[]'::jsonb))),_payload->>'message_id') RETURNING id INTO v_id;
 PERFORM public.enqueue_email('transactional_emails',_payload);
 UPDATE public.email_reply_threads SET updated_at=now() WHERE id=_thread_id;
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.queue_email_thread_item(uuid,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_email_thread_item(uuid,jsonb,jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.ingest_email_thread_reply(_thread_id uuid, _item jsonb, _notifications jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_notification jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(_item->>'provider_email_id', 0));
 SELECT id INTO v_id FROM public.email_reply_items WHERE provider_email_id=_item->>'provider_email_id' OR rfc_message_id=_item->>'rfc_message_id';
 IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 INSERT INTO public.email_reply_items(thread_id,direction,sender_email,recipient_email,subject,body_text,body_html,rfc_message_id,in_reply_to,reference_ids,provider_email_id,status)
 VALUES(_thread_id,'received',_item->>'sender_email',_item->>'recipient_email',_item->>'subject',coalesce(_item->>'body_text',''),coalesce(_item->>'body_html',''),_item->>'rfc_message_id',_item->>'in_reply_to',ARRAY(SELECT jsonb_array_elements_text(coalesce(_item->'reference_ids','[]'::jsonb))),_item->>'provider_email_id','received') RETURNING id INTO v_id;
 FOR v_notification IN SELECT value FROM jsonb_array_elements(_notifications) LOOP
 INSERT INTO public.email_reply_notifications(item_id,recipient_email,queue_message_id,rfc_message_id) VALUES(v_id,v_notification->>'to',v_notification->>'message_id',v_notification->'headers'->>'Message-ID');
 PERFORM public.enqueue_email('transactional_emails',v_notification);
 END LOOP;
 INSERT INTO public.email_reply_events(provider_email_id,thread_id,outcome) VALUES(_item->>'provider_email_id',_thread_id,'processed') ON CONFLICT(provider_email_id) DO UPDATE SET outcome='processed',thread_id=_thread_id,reason=NULL;
 UPDATE public.email_reply_threads SET updated_at=now() WHERE id=_thread_id;
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.ingest_email_thread_reply(uuid,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_email_thread_reply(uuid,jsonb,jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.email_thread_delivery_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.email_reply_items SET status=CASE WHEN NEW.status='sent' THEN 'accepted' WHEN NEW.status='dlq' THEN 'failed' ELSE NEW.status END, error_message=NEW.error_message WHERE queue_message_id=NEW.message_id AND status NOT IN ('delivered','bounced');
 UPDATE public.email_reply_notifications SET status=CASE WHEN NEW.status='sent' THEN 'accepted' WHEN NEW.status='dlq' THEN 'failed' ELSE NEW.status END, error_message=NEW.error_message WHERE queue_message_id=NEW.message_id AND status NOT IN ('delivered','bounced');
 RETURN NEW;
END; $$;
CREATE TRIGGER email_thread_delivery_log AFTER INSERT ON public.email_send_log FOR EACH ROW EXECUTE FUNCTION public.email_thread_delivery_update();
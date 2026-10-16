import { supabase } from "@/integrations/supabase/client";

export async function sendQuotationEmail(quotationId: string) {
  const { data, error } = await supabase.functions.invoke("send-quotation-email", {
    body: { quotation_id: quotationId },
  });
  if (error) {
    let message = "Unable to send the quotation email. Please try again.";
    try {
      const detail = await error.context?.json();
      if (typeof detail?.error === "string") message = detail.error;
    } catch {
      // A network failure may not include a readable response.
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.success || !data?.queued) {
    throw new Error("The quotation was not queued. Please try again.");
  }
  return data;
}
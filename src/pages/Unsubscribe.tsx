import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const sid = params.get("sid");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async () => {
    if (!sid) return setStatus("error");
    setStatus("loading");
    const { error } = await supabase.functions.invoke("email-unsubscribe", { body: { sid } });
    setStatus(error ? "error" : "done");
  };

  useEffect(() => { if (sid && status === "idle") submit(); }, [sid]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-border/50 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">Email preferences</h1>
        {!sid && <p className="text-muted-foreground">Invalid unsubscribe link.</p>}
        {status === "loading" && <p className="text-muted-foreground">Updating your preferences…</p>}
        {status === "done" && <p className="text-foreground">You have been unsubscribed from RAC Logistics marketing emails. You will still receive transactional updates about your shipments and account.</p>}
        {status === "error" && (
          <>
            <p className="text-muted-foreground mb-4">We couldn't update your preferences automatically.</p>
            <Button onClick={submit}>Try again</Button>
          </>
        )}
      </div>
    </div>
  );
}
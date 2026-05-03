import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
import { Loader2, DollarSign, Wallet, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

const quickAmounts = [50, 100, 250, 500, 1000, 5000];

const AddFundsDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: AddFundsDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("wallet_transactions").insert({
        user_id: userId,
        amount: numAmount,
        type: "credit",
        description: description || `Wallet top-up by admin`,
      });

      if (error) throw error;

      toast.success(`$${numAmount.toFixed(2)} added to ${userName}'s wallet`);
      setAmount("");
      setDescription("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("Failed to add funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange} ariaTitle="Add Funds">
      <ModalHeader
        title="Add Funds"
        subtitle={`Credit to ${userName}'s wallet`}
        icon={<Wallet className="w-5 h-5" />}
      />
      <ModalBody className="space-y-5">
          {/* Amount Input */}
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Amount (USD) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">$</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-9 h-12 text-lg font-semibold border-border/60"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(qa.toString())}
                  className={`h-9 rounded-lg border text-[13px] font-medium transition-all ${
                    amount === qa.toString()
                      ? "border-primary bg-primary/8 text-primary shadow-sm"
                      : "border-border/60 bg-background text-foreground hover:border-border hover:bg-muted/30"
                  }`}
                >
                  ${qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Description (Optional)</label>
            <Textarea
              placeholder="e.g., Bank transfer received"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border-border/60 text-[13px] resize-none"
            />
          </div>

          {/* Security */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Funds will be credited instantly to the user's wallet.</span>
          </div>
      </ModalBody>
      <ModalFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 sm:h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="flex-1 h-11 sm:h-12"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Add Funds
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
      </ModalFooter>
    </ModalShell>
  );
};

export default AddFundsDialog;

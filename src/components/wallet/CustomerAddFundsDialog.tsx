import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, CreditCard, Building2, Phone } from "lucide-react";

interface CustomerAddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerAddFundsDialog = ({ open, onOpenChange }: CustomerAddFundsDialogProps) => {
  const [amount, setAmount] = useState("");

  const bankDetails = {
    bankName: "First National Bank",
    accountName: "LogisticsWeb Ltd",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    reference: "WALLET-TOPUP",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleClose = () => {
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Add Funds to Wallet
          </DialogTitle>
          <DialogDescription>
            Transfer funds to our bank account to top up your wallet balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount you want to add (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>

          {/* Bank Details */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Bank Transfer Details</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bank Name</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{bankDetails.bankName}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Name</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{bankDetails.accountName}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{bankDetails.accountNumber}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Routing Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{bankDetails.routingNumber}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.routingNumber, "Routing number")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">{bankDetails.reference}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.reference, "Reference")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-foreground mb-2">Important Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Include the reference code in your transfer</li>
              <li>Your balance will be updated within 24 hours</li>
              <li>Contact support if funds aren't credited</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>Need help? Contact us at support@logisticsweb.com</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button 
            variant="cta" 
            onClick={() => {
              toast.success("Bank details noted! Complete your transfer and we'll credit your account.");
              handleClose();
            }}
          >
            I've Made the Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAddFundsDialog;

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
  buttonVariant?: "ghost" | "outline";
  buttonSize?: "icon" | "iconSm" | "sm" | "default";
  buttonClassName?: string;
}

const DeleteConfirmDialog = ({
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  trigger,
  buttonVariant = "ghost",
  buttonSize = "iconSm",
  buttonClassName = "",
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={buttonClassName || "rounded-[10px] border border-destructive/20 bg-destructive/[0.03] text-destructive shadow-[0_8px_18px_rgba(220,38,38,0.05)] hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"}
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;

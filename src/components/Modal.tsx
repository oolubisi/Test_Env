/* ───────────────────────────────────────────
   Modal — Reusable dialog wrapper
   ─────────────────────────────────────────── */

import type { ReactNode, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e: FormEvent) => void;
  submitText?: string;
  submitDisabled?: boolean;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText = "Save",
  submitDisabled = false,
  footer,
  size = "md",
}: ModalProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto", sizeMap[size])}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {onSubmit ? (
          <form onSubmit={handleSubmit}>
            <div className="py-2">{children}</div>

            {footer ? (
              footer
            ) : (
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitDisabled}
                  size="sm"
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                >
                  {submitText}
                </Button>
              </DialogFooter>
            )}
          </form>
        ) : (
          <>
            <div className="py-2">{children}</div>
            {footer && <div className="mt-4">{footer}</div>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

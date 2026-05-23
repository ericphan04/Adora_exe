import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";

export type ConfirmVariant = "default" | "destructive" | "success";

export interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | undefined
>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  const variant = pending?.variant ?? "default";
  const Icon =
    variant === "destructive"
      ? AlertTriangle
      : variant === "success"
        ? HelpCircle
        : HelpCircle;

  const iconWrapClass =
    variant === "destructive"
      ? "bg-red-50 text-red-600"
      : variant === "success"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-[#EFF6FF] text-[#1D4ED8]";

  const confirmBtnClass =
    variant === "destructive"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : variant === "success"
        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
        : "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) close(false);
        }}
      >
        <AlertDialogContent className="sm:max-w-md border-[#E3E8EF] bg-white p-0 overflow-hidden gap-0">
          <AlertDialogHeader className="px-6 pt-6 pb-2 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrapClass}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <AlertDialogTitle className="text-[#1E293B] text-base">
                  {pending?.title ?? "Xác nhận thao tác"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#6B7A8D] text-sm mt-1.5 leading-relaxed">
                  {pending?.description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-slate-50 border-t border-[#E3E8EF] sm:justify-end gap-2">
            <AlertDialogCancel
              onClick={() => close(false)}
              className="cursor-pointer border-[#E3E8EF] text-[#6B7A8D] hover:bg-white"
            >
              {pending?.cancelLabel ?? "Huỷ"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => close(true)}
              className={`cursor-pointer ${confirmBtnClass}`}
            >
              {pending?.confirmLabel ?? "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}

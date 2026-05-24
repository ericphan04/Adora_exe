import { toast } from "sonner";

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description, duration: 4000 });
  },
  error(message: string, description?: string) {
    toast.error(message, { description, duration: 5000 });
  },
  info(message: string, description?: string) {
    toast.info(message, { description, duration: 4000 });
  },
};

export function apiErrorMessage(err: unknown, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || fallback;
}

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useThemeContext } from "../../context/ThemeContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useThemeContext();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast border border-[#E3E8EF] shadow-lg rounded-xl font-sans",
          title: "text-sm font-semibold text-[#1E293B]",
          description: "text-xs text-[#6B7A8D]",
          success: "border-emerald-200",
          error: "border-red-200",
          info: "border-[#BAE6FD]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

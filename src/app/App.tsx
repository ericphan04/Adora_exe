import React from 'react';
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <RouterProvider router={router} />
            <Toaster />
          </ConfirmProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

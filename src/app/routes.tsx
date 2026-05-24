import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import BillboardListingPage from "./pages/BillboardListingPage";
import BillboardDetailPage from "./pages/BillboardDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdvertiserDashboard from "./pages/AdvertiserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import ProtectedRoute from "./components/ProtectedRoute";

const ProtectedAdvertiser = () => (
  <ProtectedRoute allowedRoles={["RENTER"]}>
    <AdvertiserDashboard />
  </ProtectedRoute>
);

const ProtectedOwner = () => (
  <ProtectedRoute allowedRoles={["OWNER"]}>
    <OwnerDashboard />
  </ProtectedRoute>
);

const ProtectedAdmin = () => (
  <ProtectedRoute allowedRoles={["ADMIN"]}>
    <AdminDashboard />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/billboards", Component: BillboardListingPage },
  { path: "/billboard/:id", Component: BillboardDetailPage },
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/advertiser", Component: ProtectedAdvertiser },
  { path: "/advertiser/*", Component: ProtectedAdvertiser },
  { path: "/owner", Component: ProtectedOwner },
  { path: "/owner/*", Component: ProtectedOwner },
  { path: "/admin", Component: ProtectedAdmin },
  { path: "/admin/*", Component: ProtectedAdmin },
  { path: "/payment/status", Component: PaymentStatusPage },
]);


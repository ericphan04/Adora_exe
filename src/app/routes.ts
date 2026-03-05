import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import BillboardListingPage from "./pages/BillboardListingPage";
import BillboardDetailPage from "./pages/BillboardDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdvertiserDashboard from "./pages/AdvertiserDashboard";
import AdvertiserBookings from "./pages/AdvertiserBookings";
import AdvertiserSaved from "./pages/AdvertiserSaved";
import AdvertiserCampaigns from "./pages/AdvertiserCampaigns";
import AdvertiserInvoices from "./pages/AdvertiserInvoices";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/billboards", Component: BillboardListingPage },
  { path: "/billboard/:id", Component: BillboardDetailPage },
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/advertiser", Component: AdvertiserDashboard },
  { path: "/advertiser/bookings", Component: AdvertiserBookings },
  { path: "/advertiser/campaigns", Component: AdvertiserCampaigns },
  { path: "/advertiser/invoices", Component: AdvertiserInvoices },
  { path: "/advertiser/saved", Component: AdvertiserSaved },
  { path: "/advertiser/*", Component: AdvertiserDashboard },
  { path: "/owner", Component: OwnerDashboard },
  { path: "/owner/*", Component: OwnerDashboard },
  { path: "/admin", Component: AdminDashboard },
  { path: "/admin/*", Component: AdminDashboard },
]);

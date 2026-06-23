import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsent from "@/components/CookieConsent";
import BadgeCover from "@/components/BadgeCover";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import DogProfile from "./pages/DogProfile";
import AddDog from "./pages/AddDog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import RegistrationCanceled from "./pages/RegistrationCanceled";
import Rules from "./pages/Rules";
import HowItWorks from "./pages/HowItWorks";
import Winners from "./pages/Winners";
import Certificate from "./pages/Certificate";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import EShop from "./pages/EShop";
import EShopSuccess from "./pages/EShopSuccess";
import ProductDetail from "./pages/ProductDetail";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDogs from "./pages/admin/AdminDogs";
import AdminComments from "./pages/admin/AdminComments";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminContent from "./pages/admin/AdminContent";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminShelters from "./pages/admin/AdminShelters";
import Partners from "./pages/Partners";
import Shelters from "./pages/Shelters";
import SupportPlatform from "./pages/SupportPlatform";
import SupportSuccess from "./pages/SupportSuccess";
import Transparency from "./pages/Transparency";
import AdminSupporters from "./pages/admin/AdminSupporters";
import AdminTransparency from "./pages/admin/AdminTransparency";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyOrders from "./pages/MyOrders";
import Donate from "./pages/Donate";
import DonateSuccess from "./pages/DonateSuccess";
import AccountSettings from "./pages/AccountSettings";
import Leaderboard from "./pages/Leaderboard";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/pes/:id" element={<DogProfile />} />
            <Route path="/pridat" element={<AddDog />} />
            <Route path="/prihlasenie" element={<Login />} />
            <Route path="/registracia" element={<Register />} />
            <Route path="/zabudnute-heslo" element={<ForgotPassword />} />
            <Route path="/reset-hesla" element={<ResetPassword />} />
            <Route path="/platba-uspesna" element={<PaymentSuccess />} />
            <Route path="/registracia-zrusena" element={<RegistrationCanceled />} />
            <Route path="/pravidla" element={<Rules />} />
            <Route path="/ako-funguje" element={<HowItWorks />} />
            <Route path="/vitazi" element={<Winners />} />
            <Route path="/certifikat/:id" element={<Certificate />} />
            <Route path="/ochrana-udajov" element={<Privacy />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/eshop" element={<EShop />} />
            <Route path="/eshop/:id" element={<ProductDetail />} />
            <Route path="/eshop-dakujeme" element={<EShopSuccess />} />
            <Route path="/moje-objednavky" element={<MyOrders />} />
            <Route path="/podporit" element={<Donate />} />
            <Route path="/dakujeme-za-prispevok" element={<DonateSuccess />} />
            <Route path="/nastavenia" element={<AccountSettings />} />
            <Route path="/rebricek" element={<Leaderboard />} />
            <Route path="/moj-profil" element={<MyProfile />} />
            <Route path="/partneri" element={<Partners />} />
            <Route path="/utulky" element={<Shelters />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="pouzivatelia" element={<AdminUsers />} />
              <Route path="psy" element={<AdminDogs />} />
              <Route path="komentare" element={<AdminComments />} />
              <Route path="platby" element={<AdminPayments />} />
              <Route path="produkty" element={<AdminProducts />} />
              <Route path="partneri" element={<AdminSponsors />} />
              <Route path="utulky" element={<AdminShelters />} />
              <Route path="obsah" element={<AdminContent />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CookieConsent />
        <BadgeCover />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

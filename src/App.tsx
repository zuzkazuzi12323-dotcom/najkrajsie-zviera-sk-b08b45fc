import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import DogProfile from "./pages/DogProfile";
import AddDog from "./pages/AddDog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import Rules from "./pages/Rules";
import HowItWorks from "./pages/HowItWorks";
import Winners from "./pages/Winners";
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
import MyOrders from "./pages/MyOrders";
import Donate from "./pages/Donate";
import DonateSuccess from "./pages/DonateSuccess";
import AccountSettings from "./pages/AccountSettings";
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
            <Route path="/platba-uspesna" element={<PaymentSuccess />} />
            <Route path="/pravidla" element={<Rules />} />
            <Route path="/ako-funguje" element={<HowItWorks />} />
            <Route path="/vitazi" element={<Winners />} />
            <Route path="/ochrana-udajov" element={<Privacy />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/eshop" element={<EShop />} />
            <Route path="/eshop/:id" element={<ProductDetail />} />
            <Route path="/eshop-dakujeme" element={<EShopSuccess />} />
            <Route path="/moje-objednavky" element={<MyOrders />} />
            <Route path="/podporit" element={<Donate />} />
            <Route path="/dakujeme-za-prispevok" element={<DonateSuccess />} />
            <Route path="/nastavenia" element={<AccountSettings />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="pouzivatelia" element={<AdminUsers />} />
              <Route path="psy" element={<AdminDogs />} />
              <Route path="komentare" element={<AdminComments />} />
              <Route path="platby" element={<AdminPayments />} />
              <Route path="produkty" element={<AdminProducts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

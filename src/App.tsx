import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index.tsx";
import Browse from "./pages/Browse.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import Auth from "./pages/Auth.tsx";
import Account from "./pages/Account.tsx";
import CreateListing from "./pages/CreateListing.tsx";
import Messages from "./pages/Messages.tsx";
import About from "./pages/About.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import DobaaraVerified from "./pages/DobaaraVerified.tsx";
import SellingGuide from "./pages/SellingGuide.tsx";
import SizeGuide from "./pages/SizeGuide.tsx";
import FAQ from "./pages/FAQ.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/sell" element={<CreateListing />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/dobaara-verified" element={<DobaaraVerified />} />
              <Route path="/selling-guide" element={<SellingGuide />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

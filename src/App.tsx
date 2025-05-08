
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/Home";
import Purchase from "./pages/Purchase";
import Inventory from "./pages/Inventory";
import Customer from "./pages/Customer";
import ProductPrice from "./pages/ProductPrice";
import Sales from "./pages/Sales";
import Billing from "./pages/Billing";
import Report from "./pages/Report";
import Order from "./pages/Order";
import Supplier from "./pages/Supplier";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/purchase" element={<MainLayout><Purchase /></MainLayout>} />
          <Route path="/inventory" element={<MainLayout><Inventory /></MainLayout>} />
          <Route path="/customer" element={<MainLayout><Customer /></MainLayout>} />
          <Route path="/product-price" element={<MainLayout><ProductPrice /></MainLayout>} />
          <Route path="/sales" element={<MainLayout><Sales /></MainLayout>} />
          <Route path="/billing" element={<MainLayout><Billing /></MainLayout>} />
          <Route path="/report" element={<MainLayout><Report /></MainLayout>} />
          <Route path="/order" element={<MainLayout><Order /></MainLayout>} />
          <Route path="/supplier" element={<MainLayout><Supplier /></MainLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

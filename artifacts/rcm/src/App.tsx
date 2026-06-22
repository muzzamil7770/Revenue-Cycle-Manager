import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Insurance from "@/pages/Insurance";
import Charges from "@/pages/Charges";
import Coding from "@/pages/Coding";
import Claims from "@/pages/Claims";
import ClaimDetail from "@/pages/ClaimDetail";
import Denials from "@/pages/Denials";
import Payments from "@/pages/Payments";
import Billing from "@/pages/Billing";
import AR from "@/pages/AR";
import Reports from "@/pages/Reports";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients" component={Patients} />
        <Route path="/patients/:id" component={PatientDetail} />
        <Route path="/insurance" component={Insurance} />
        <Route path="/charges" component={Charges} />
        <Route path="/coding" component={Coding} />
        <Route path="/claims" component={Claims} />
        <Route path="/claims/:id" component={ClaimDetail} />
        <Route path="/denials" component={Denials} />
        <Route path="/payments" component={Payments} />
        <Route path="/billing" component={Billing} />
        <Route path="/ar" component={AR} />
        <Route path="/reports" component={Reports} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

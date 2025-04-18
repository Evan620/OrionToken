import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BlockchainProvider } from "@/contexts/BlockchainContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tokenize from "@/pages/tokenize";
import Marketplace from "@/pages/marketplace";
import Portfolio from "@/pages/portfolio";
import AssetDetails from "@/pages/asset-details";
import AssetTypeList from "@/pages/asset-type-list";
import Settings from "@/pages/settings";
import Compliance from "@/pages/compliance";
import AppShell from "@/components/layout/app-shell";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tokenize" component={Tokenize} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/assets/:id" component={AssetDetails} />
        <Route path="/assets/real-estate" component={AssetTypeList} />
        <Route path="/assets/invoices" component={AssetTypeList} />
        <Route path="/assets/equipment" component={AssetTypeList} />
        <Route path="/settings" component={Settings} />
        <Route path="/compliance" component={Compliance} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BlockchainProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </BlockchainProvider>
    </QueryClientProvider>
  );
}

export default App;

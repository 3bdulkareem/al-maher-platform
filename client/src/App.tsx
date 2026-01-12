import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RecordRecitation from "./pages/RecordRecitation";
import PeerReview from "./pages/PeerReview";
import Profile from "./pages/Profile";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 text-center space-y-6 max-w-md">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-primary-foreground">م</span>
          </div>
          <h1 className="text-2xl font-bold">منصة الماهر</h1>
          <p className="text-muted-foreground">
            يرجى تسجيل الدخول للوصول إلى المنصة
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full gradient-primary text-primary-foreground font-bold"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/record">
        {() => <ProtectedRoute component={RecordRecitation} />}
      </Route>
      <Route path="/review">
        {() => <ProtectedRoute component={PeerReview} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

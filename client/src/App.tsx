import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VerifyOtp from "@/pages/auth/verify-otp";
import AdminReset from "@/pages/admin/reset";
import Dashboard from "@/pages/dashboard/index";
import Tasks from "@/pages/dashboard/tasks";
import Team from "@/pages/dashboard/team";
import Analytics from "@/pages/dashboard/analytics";
import CognitiveInsights from "@/pages/dashboard/cognitive-insights";
import SkillDevelopment from "@/pages/dashboard/skill-development";
import SentimentAnalysis from "@/pages/dashboard/sentiment-analysis";
import ConflictResolution from "@/pages/dashboard/conflict-resolution";
import Profile from "@/pages/dashboard/profile";
import Settings from "@/pages/dashboard/settings";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ChatWindow from "./components/chatbot/chat-window";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/tasks" component={Tasks} />
      <Route path="/dashboard/team" component={Team} />
      <Route path="/dashboard/analytics" component={Analytics} />
      <Route path="/dashboard/cognitive-insights" component={CognitiveInsights} />
      <Route path="/dashboard/skill-development" component={SkillDevelopment} />
      <Route path="/dashboard/sentiment-analysis" component={SentimentAnalysis} />
      <Route path="/dashboard/conflict-resolution" component={ConflictResolution} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/admin/reset" component={AdminReset} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="neural-allocate-theme">
        <Router />
        <ChatWindow />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

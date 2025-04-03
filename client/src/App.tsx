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
      <Route path="/admin/reset" component={AdminReset} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ChatWindow />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

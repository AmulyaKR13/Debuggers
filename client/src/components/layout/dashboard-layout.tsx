import { useState, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import Sidebar from "./sidebar";
import { useCurrentUser, useIsAuthenticated } from "@/lib/auth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import NotificationCenter from "@/components/notifications/notification-center";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = "Dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const { data: user } = useCurrentUser();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <span className="material-icons">menu</span>
        </button>
        <h1 className="text-xl font-semibold">NeurAllocate</h1>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <span className="material-icons dark:hidden">dark_mode</span>
          <span className="material-icons hidden dark:block">light_mode</span>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            
            <div className="flex items-center space-x-4">
              {/* Notification Center */}
              <NotificationCenter />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <img 
                      className="h-8 w-8 rounded-full" 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=1F8A28&color=fff`}
                      alt="User avatar" 
                    />
                    <span className="ml-2 text-sm font-medium">{user?.name || "User"}</span>
                    <span className="material-icons ml-1 text-gray-500">arrow_drop_down</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <span className="material-icons mr-2 text-gray-500 text-sm">person</span>
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <span className="material-icons mr-2 text-gray-500 text-sm">settings</span>
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
                    <span className="material-icons mr-2 text-gray-500 text-sm">
                      {theme === "dark" ? "light_mode" : "dark_mode"}
                    </span>
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/logout">
                    <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                      <span className="material-icons mr-2 text-sm">logout</span>
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-4 px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2">brain</span>
                <span className="font-semibold">NeurAllocate</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                AI-Powered Task Allocation System
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Powered by Microsoft AI Foundry</span>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-4"></div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-primary">Documentation</a>
                <a href="#" className="hover:text-primary">Support</a>
                <a href="#" className="hover:text-primary">Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

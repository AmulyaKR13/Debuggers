import { useState, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import Sidebar from "./sidebar";
import { useCurrentUser, useIsAuthenticated } from "@/lib/auth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

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
              <div className="relative">
                <button className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white">
                  <span className="material-icons">notifications</span>
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">3</span>
                </button>
              </div>
              
              <div className="flex items-center">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt="User avatar" 
                />
                <span className="ml-2 text-sm font-medium">{user?.name || "User"}</span>
                <span className="material-icons ml-1 text-gray-500">arrow_drop_down</span>
              </div>
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

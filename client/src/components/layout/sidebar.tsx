import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { useLogout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const logout = useLogout();
  const { toast } = useToast();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location === path ? 
      "text-primary bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary" : 
      "text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 transition-transform duration-300 transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 z-30
          bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 ml-2 pl-1">
            <span className="material-icons text-primary text-3xl">brain</span>
            <span className="text-xl font-semibold whitespace-nowrap">NeurAllocate</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hidden lg:block"
          >
            <span className="material-icons dark:hidden">dark_mode</span>
            <span className="material-icons hidden dark:block">light_mode</span>
          </button>
        </div>
        
        <nav className="mt-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </div>
          <Link href="/dashboard">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard")}`}>
              <span className="material-icons mr-3">dashboard</span> Dashboard
            </a>
          </Link>
          <Link href="/dashboard/tasks">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/tasks")}`}>
              <span className="material-icons mr-3">assignment</span> Tasks
            </a>
          </Link>
          <Link href="/dashboard/team">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/team")}`}>
              <span className="material-icons mr-3">groups</span> Team
            </a>
          </Link>
          <Link href="/dashboard/analytics">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/analytics")}`}>
              <span className="material-icons mr-3">analytics</span> Analytics
            </a>
          </Link>
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            AI Features
          </div>
          <Link href="/dashboard/cognitive-insights">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/cognitive-insights")}`}>
              <span className="material-icons mr-3">psychology</span> Cognitive Insights
            </a>
          </Link>
          <Link href="/dashboard/skill-development">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/skill-development")}`}>
              <span className="material-icons mr-3">school</span> Skill Development
            </a>
          </Link>
          <Link href="/dashboard/sentiment-analysis">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/sentiment-analysis")}`}>
              <span className="material-icons mr-3">mood</span> Sentiment Analysis
            </a>
          </Link>
          <Link href="/dashboard/conflict-resolution">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/conflict-resolution")}`}>
              <span className="material-icons mr-3">mediation</span> Conflict Resolution
            </a>
          </Link>
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Account
          </div>
          <Link href="/dashboard/profile">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/profile")}`}>
              <span className="material-icons mr-3">person</span> Profile
            </a>
          </Link>
          <Link href="/dashboard/settings">
            <a className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/dashboard/settings")}`}>
              <span className="material-icons mr-3">settings</span> Settings
            </a>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent"
          >
            <span className="material-icons mr-3">logout</span> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

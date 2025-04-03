import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function AdminReset() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClearUsers = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await apiRequest("POST", "/api/dev/clear-users", {});
      const data = await response.json();
      
      setMessage(`Success: ${data.message}`);
    } catch (error) {
      console.error("Error clearing users:", error);
      setMessage("Error: Failed to clear users. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-500">Admin: Reset Database</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This will clear all user accounts and OTP codes from the database.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleClearUsers}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            disabled={loading}
          >
            {loading ? "Clearing data..." : "Clear all users"}
          </Button>
          
          {message && (
            <div className={`p-4 rounded text-center ${message.startsWith("Success") ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"}`}>
              {message}
            </div>
          )}
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              After clearing, you will need to register new accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
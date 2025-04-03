import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useVerifyOtp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTheme } from "@/components/ui/theme-provider";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const email = searchParams.get("email") || "";
  const otpParam = searchParams.get("otp") || "";
  const { toast } = useToast();
  const verifyOtp = useVerifyOtp();
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  
  useEffect(() => {
    if (!email) {
      setLocation("/register");
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [email, setLocation]);
  
  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: otpParam,
    },
  });
  
  // Set the OTP value from URL params if available and auto-submit if valid
  useEffect(() => {
    if (otpParam) {
      form.setValue("otp", otpParam);
      
      // Auto-submit if OTP is valid (6 digits)
      if (otpParam.length === 6 && /^\d+$/.test(otpParam)) {
        const timer = setTimeout(() => {
          form.handleSubmit((data) => {
            verifyOtp.mutate({
              email,
              otp: data.otp,
            });
          })();
        }, 1000); // Short delay to allow user to see what's happening
        
        return () => clearTimeout(timer);
      }
    }
  }, [otpParam, form, email, verifyOtp]);

  const onSubmit = async (data: OTPFormValues) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please register again.",
        variant: "destructive",
      });
      setLocation("/register");
      return;
    }
    
    try {
      await verifyOtp.mutateAsync({
        email,
        otp: data.otp,
      });
      
      toast({
        title: "Verification successful",
        description: "Your email has been verified. You can now log in.",
      });
      
      setLocation("/login");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: "Invalid or expired OTP code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Format countdown to minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div className="text-center">
          <div className="flex justify-center">
            <span className="material-icons text-5xl text-primary">verified_user</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification code to {email}
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel htmlFor="otp-code">Enter OTP Code</FormLabel>
                    <FormControl>
                      <Input 
                        id="otp-code" 
                        type="text" 
                        placeholder="6-digit code"
                        autoComplete="one-time-code"
                        maxLength={6}
                        {...field} 
                      />
                    </FormControl>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      The OTP will expire in {formatTime(countdown)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full flex justify-center py-2"
                disabled={verifyOtp.isPending || countdown === 0}
              >
                {verifyOtp.isPending ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="material-icons mr-2">check_circle</span>
                    Verify
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{" "}
            <button 
              className="font-medium text-primary hover:text-blue-500"
              onClick={() => {
                toast({
                  title: "OTP Resent",
                  description: "A new verification code has been sent to your email",
                });
                setCountdown(300); // Reset countdown
              }}
              disabled={countdown > 270} // Disable for first 30 seconds
            >
              Resend OTP
            </button>
          </p>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="material-icons dark:hidden">dark_mode</span>
            <span className="material-icons hidden dark:block">light_mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}

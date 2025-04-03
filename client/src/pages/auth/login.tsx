import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/components/ui/theme-provider";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login.mutateAsync({
        email: data.email,
        password: data.password,
      });
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div className="text-center">
          <div className="flex justify-center">
            <span className="material-icons text-5xl text-primary">brain</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">NeurAllocate</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">AI-Powered Task Allocation</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md -space-y-px">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel htmlFor="email-address">Email address</FormLabel>
                    <FormControl>
                      <Input 
                        id="email-address" 
                        type="email" 
                        placeholder="Email address"
                        autoComplete="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Password"
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                )}
              />

              <div className="text-sm">
                <Link href="/forgot-password">
                  <a className="font-medium text-primary hover:text-blue-500">
                    Forgot your password?
                  </a>
                </Link>
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full flex justify-center py-2"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="material-icons mr-2">login</span>
                    Sign in
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-blue-500">
              Register now
            </Link>
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

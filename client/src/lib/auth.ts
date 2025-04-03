import { apiRequest } from "./queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type OtpVerificationData = {
  email: string;
  otp: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  email: string;
  otp: string;
  newPassword: string;
};

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
  });
};

// Verify OTP mutation
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: OtpVerificationData) => {
      return await apiRequest("POST", "/api/auth/verify-otp", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      return await apiRequest("POST", "/api/auth/forgot-password", data);
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      return await apiRequest("POST", "/api/auth/reset-password", data);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Current user query
export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ["/api/user/me"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/user/me");
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
      }
    },
    retry: false,
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

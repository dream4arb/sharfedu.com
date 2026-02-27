import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/lib/api-base";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role: string;
  stageSlug?: string | null;
  gradeId?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("/api/auth/user"), { credentials: "include" });
      const data = await res.json().catch(() => null);
      if (data && typeof data === "object" && !Array.isArray(data) && data.id && data.role) {
        setUser(data as AuthUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch(getApiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
      setUser(null);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut,
    refetch: fetchUser,
  };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

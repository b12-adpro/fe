// contexts/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const AUTH_API_BASE_URL = "https://kind-danyelle-nout-721a9e0a.koyeb.app";

// --- Definisi Tipe (tetap sama) ---
interface UserData {
  id: string;
  username: string;
  email: string;
  roles: string[];
  fullName?: string;
}

interface RegistrationDataType {
    fullNameInput: string;
    emailInput: string;
    phoneNumberInput: string;
    passwordInput: string;
    addressInput: string;
}

interface LoginApiResponse {
    token: string;
    message?: string;
    error?: string;
}

interface DecodedJwtPayload {
  sub: string;
  username?: string;
  name?: string;
  fullName?: string;
  email?: string;
  roles?: string[] | string;
  role?: string;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  loading: boolean;
  initialAuthCheckComplete: boolean;
  isAdmin: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<void>;
  register: (registrationData: RegistrationDataType) => Promise<void>;
  logout: () => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkIsAdmin = useCallback((rolesArray: string[] | undefined | null): boolean => {
    if (!rolesArray || rolesArray.length === 0) return false;
    return rolesArray.some(role => role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ROLE_ADMIN");
  }, []);

  const processAndSetAuthState = useCallback((currentToken: string | null) => {
    if (currentToken) {
      try {
        const decodedToken = jwtDecode<DecodedJwtPayload>(currentToken);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          throw new Error("Token expired");
        }
        let userRoles: string[] = [];
        if (decodedToken.roles) {
          if (Array.isArray(decodedToken.roles)) userRoles = decodedToken.roles.map(r => String(r).toUpperCase());
          else if (typeof decodedToken.roles === 'string') userRoles = decodedToken.roles.split(/[, ]+/).map(r => r.trim().toUpperCase());
        } else if (decodedToken.role && typeof decodedToken.role === 'string') {
          userRoles = [String(decodedToken.role).toUpperCase()];
        }
        if (userRoles.length === 0 && decodedToken.sub) userRoles = ["USER"];
        const userDataFromToken: UserData = {
          id: String(decodedToken.sub),
          username: String(decodedToken.username || decodedToken.name || decodedToken.fullName || decodedToken.email || "User"),
          email: String(decodedToken.email || "no-email@from.jwt"),
          roles: userRoles,
          fullName: String(decodedToken.fullName || decodedToken.name || "")
        };
        if (!userDataFromToken.id || !userDataFromToken.email) {
            throw new Error("Essential user data missing from token.");
        }
        setUser(userDataFromToken);
        setToken(currentToken);
        setIsAuthenticated(true);
        setIsAdmin(checkIsAdmin(userRoles));
        if (typeof window !== "undefined") {
            localStorage.setItem("jwtToken", currentToken);
            localStorage.setItem("userData", JSON.stringify(userDataFromToken));
        }
        return true;
      } catch {
        if (typeof window !== "undefined") {
            localStorage.removeItem("jwtToken"); localStorage.removeItem("userData");
        }
        setUser(null); setToken(null); setIsAuthenticated(false); setIsAdmin(false);
        return false;
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("jwtToken"); localStorage.removeItem("userData");
      }
      setUser(null); setToken(null); setIsAuthenticated(false); setIsAdmin(false);
      return false;
    }
  }, [checkIsAdmin]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("jwtToken");
        processAndSetAuthState(storedToken);
    } else {
        processAndSetAuthState(null);
    }
    setInitialAuthCheckComplete(true);
    setLoading(false);
  }, [processAndSetAuthState]);

  const login = async (emailInput: string, passwordInput: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data: LoginApiResponse = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Login failed.");
      if (data.token) {
        const loginProcessed = processAndSetAuthState(data.token);
        if (loginProcessed) {
          const decodedForRedirect = jwtDecode<DecodedJwtPayload>(data.token);
          const redirectPath = searchParams?.get('redirect');
          const userIsAdminForRedirect = checkIsAdmin(decodedForRedirect.roles as string[]);
          if (redirectPath) router.push(redirectPath);
          else if (userIsAdminForRedirect) router.push("/admin/dashboard");
          else router.push("/");
        } else { throw new Error("Failed to process token after successful login API call."); }
      } else { throw new Error("Token not found in login response."); }
    } catch (err) {
      let errorMessage = "An unexpected error occurred during login.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      setAuthError(errorMessage);
      processAndSetAuthState(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: RegistrationDataType) => {
    setAuthError(null); setLoading(true);
    try {
      const { fullNameInput, emailInput, phoneNumberInput, passwordInput, addressInput } = registrationData;
      const response = await fetch(`${AUTH_API_BASE_URL}/auth/register/user`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullNameInput, email: emailInput, phoneNumber: phoneNumberInput, password: passwordInput, address: addressInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors && typeof data.errors === 'object') {
            const errorMessages = Object.values(data.errors).join(', ');
            throw new Error(errorMessages || data.message || "Registration failed.");
        }
        throw new Error(data.message || "Registration failed.");
      }
      router.push("/auth/login?registered=true&email=" + encodeURIComponent(emailInput));
    } catch (err) {
        let errorMessage = "An unexpected error occurred during registration.";
        if (err instanceof Error) errorMessage = err.message; else if (typeof err === 'string') errorMessage = err;
        setAuthError(errorMessage);
    } finally { setLoading(false); }
  };

  const logout = () => {
    processAndSetAuthState(null);
    if (pathname !== '/auth/login' && pathname !== '/auth/register') {
        router.push("/auth/login");
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, token, loading, initialAuthCheckComplete, isAdmin,
      login, register, logout, authError, setAuthError, clearAuthError
    }}>
      {!initialAuthCheckComplete && loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading application state...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
// contexts/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// URL API temanmu (tetap ada, tapi mungkin tidak terpakai jika bypass)
const AUTH_API_BASE_URL = "https://kind-danyelle-nout-721a9e0a.koyeb.app";

// Token dummy kamu dari Postman
const DUMMY_JWT_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjNDc3NDM5YS01YzkzLTQ2OWYtODJhZC05YTQ1Y2U2NDAzZmQiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc0ODMyMTI2NCwiZXhwIjoxNzQ4MzI0ODY0fQ.3zLtj9ooDz-t2qr5wdO_H8GVRhKsk4hsY8MbrFGeP9OItsw-9owZMxOF3wLdqoQFDY0vwQZVyBsbHqBbg44I3A";
// Data user dummy yang sesuai dengan token di atas (atau data yang kamu inginkan)
const DUMMY_USER_DATA = {
  id: "c477439a-5c93-469f-82ad-9a45ce6403fd", // Ambil dari payload token jika sub adalah ID
  username: "user.postman007", // Atau fullName sesuaikan dengan data dummy loginmu
  email: "user.postman007@example.com",
  roles: ["USER"], // Atau ["ROLE_USER"] tergantung format backend
};

// Variabel environment untuk mengaktifkan mode bypass (opsional tapi lebih baik)
// Kamu bisa set ini di .env.local -> NEXT_PUBLIC_BYPASS_AUTH=true
const BYPASS_AUTH_MODE = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';


interface UserData {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  loading: boolean;
  initialAuthCheckComplete: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<void>;
  register: (registrationData: {
    fullNameInput: string;
    emailInput: string;
    phoneNumberInput: string;
    passwordInput: string;
    addressInput: string;
  }) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (BYPASS_AUTH_MODE) {
      console.warn("AUTH BYPASS MODE IS ACTIVE! User is automatically logged in.");
      setToken(DUMMY_JWT_TOKEN);
      setUser(DUMMY_USER_DATA);
      setIsAuthenticated(true);
      // Simpan juga ke localStorage agar konsisten jika ada bagian lain yang ngecek
      localStorage.setItem("jwtToken", DUMMY_JWT_TOKEN);
      localStorage.setItem("userData", JSON.stringify(DUMMY_USER_DATA));
    } else {
      const storedToken = localStorage.getItem("jwtToken");
      const storedUserDataString = localStorage.getItem("userData");
      if (storedToken && storedUserDataString) {
        try {
          const storedUserData: UserData = JSON.parse(storedUserDataString);
          // TODO: Idealnya, validasi token ke backend di sini
          setToken(storedToken);
          setUser(storedUserData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Failed to parse user data from localStorage or token invalid", e);
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("userData");
        }
      }
    }
    setInitialAuthCheckComplete(true);
  }, []); // Hanya dijalankan sekali saat mount

  const login = async (emailInput: string, passwordInput: string) => {
    if (BYPASS_AUTH_MODE) {
      console.log("Login function called in BYPASS_AUTH_MODE. No actual API call.");
      // Langsung set ke dummy user jika belum (meskipun useEffect sudah melakukannya)
      setToken(DUMMY_JWT_TOKEN);
      setUser(DUMMY_USER_DATA);
      setIsAuthenticated(true);
      localStorage.setItem("jwtToken", DUMMY_JWT_TOKEN);
      localStorage.setItem("userData", JSON.stringify(DUMMY_USER_DATA));
      router.push("/");
      return;
    }
    // ... (logika login asli tetap ada) ...
    setAuthError(null);
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Login failed.");
      if (data.token) {
        localStorage.setItem("jwtToken", data.token);
        const userDataToStore: UserData = { id: data.id, username: data.username || data.fullName, email: data.email, roles: data.roles };
        localStorage.setItem("userData", JSON.stringify(userDataToStore));
        setToken(data.token);
        setUser(userDataToStore);
        setIsAuthenticated(true);
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
        router.push(redirectUrl);
      } else {
        throw new Error("Token not found in response.");
      }
    } catch (err) {
      let errorMessage = "An unexpected error occurred during login.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      setAuthError(errorMessage);
      setIsAuthenticated(false); setUser(null); setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData: {
    fullNameInput: string;
    emailInput: string; // Pastikan ini ada di tipe input
    phoneNumberInput: string;
    passwordInput: string;
    addressInput: string;
  }) => {
    if (BYPASS_AUTH_MODE) {
      console.log("Register function called in BYPASS_AUTH_MODE. No actual API call. Redirecting to login.");
      // Ambil email dari registrationData jika ada untuk prefill, atau gunakan dummy
      const emailToPrefill = registrationData.emailInput || "dummybypass@example.com";
      router.push("/auth/login?registered=true&email=" + encodeURIComponent(emailToPrefill));
      return;
    }
    setAuthError(null);
    setLoading(true);
    try {
      // DEKONSTRUKSI YANG BENAR:
      const { fullNameInput, emailInput, phoneNumberInput, passwordInput, addressInput } = registrationData;

      const response = await fetch(`${AUTH_API_BASE_URL}/auth/register/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullNameInput,
          email: emailInput, // Gunakan variabel yang didekonstruksi
          phoneNumber: phoneNumberInput,
          password: passwordInput,
          address: addressInput
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors && typeof data.errors === 'object') {
            const errorMessages = Object.values(data.errors).join(', ');
            throw new Error(errorMessages || data.message || "Registration failed.");
        }
        throw new Error(data.message || "Registration failed.");
      }
      // Redirect ke login dengan email yang baru didaftarkan untuk pre-fill
      router.push("/auth/login?registered=true&email=" + encodeURIComponent(emailInput));
    } catch (err) {
      let errorMessage = "An unexpected error occurred during registration.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      setAuthError(errorMessage);
      console.error("Registration error in AuthContext:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (BYPASS_AUTH_MODE) {
        console.log("Logout function called in BYPASS_AUTH_MODE.");
        // Meskipun bypass, kita tetap set state seolah-olah logout
    }
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    if (pathname !== '/auth/login' && pathname !== '/auth/register') {
        router.push("/auth/login");
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, token, loading, initialAuthCheckComplete,
      login, register, logout, authError, setAuthError, clearAuthError
    }}>
      {!initialAuthCheckComplete && !BYPASS_AUTH_MODE ? ( // Hanya tampilkan loading jika tidak bypass DAN pengecekan awal belum selesai
        <div>Loading application state...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
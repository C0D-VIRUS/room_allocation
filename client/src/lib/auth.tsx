import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = "hostel-admin-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as { user: User; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
      api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setToken(data.token);
    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function logout() {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem(storageKey);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  interests: string[];
  followers_count?: number;
  following_count?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; interests: string[] }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await authAPI.login(username, password);
    const newToken = res.data.access_token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    toast({ title: "Login realizado!", description: "Bem-vindo de volta 🎉" });
  };

  const register = async (data: { username: string; email: string; password: string; interests: string[] }) => {
    await authAPI.register(data);
    toast({ title: "Conta criada!", description: "Faça login para continuar" });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast({ title: "Logout", description: "Até logo! 👋" });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

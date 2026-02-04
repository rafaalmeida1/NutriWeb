"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: "admin" | "patient";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    // Verificar token e decodificar para obter informações do usuário
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        // Decodificar JWT (sem verificar assinatura, apenas para pegar dados)
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Verificar se o token não expirou
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.warn("Token expirado");
          localStorage.removeItem("auth_token");
          setUser(null);
          setLoading(false);
          return;
        }
        
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        localStorage.removeItem("auth_token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    
    // Escutar mudanças no localStorage (para quando o token é atualizado em outra aba)
    const handleStorageChange = (e: StorageEvent | Event) => {
      // StorageEvent para mudanças entre abas, Event customizado para mesma aba
      if (e instanceof StorageEvent) {
        if (e.key === "auth_token") {
          loadUser();
        }
      } else {
        // Event customizado disparado quando token é salvo na mesma aba
        loadUser();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Escutar evento customizado para atualização na mesma aba
    window.addEventListener("auth-token-updated", handleStorageChange);
    
    // Verificar token periodicamente (a cada 30 segundos)
    const interval = setInterval(() => {
      loadUser();
    }, 30000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-token-updated", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevenir múltiplas execuções
    if (hasRedirected.current) return;
    
    const token = searchParams.get("token");
    
    if (token) {
      // Salvar token
      api.setToken(token);
      
      // Disparar evento customizado para atualizar AuthContext
      window.dispatchEvent(new Event("auth-token-updated"));
      
      // Aguardar um pouco para garantir que o token foi salvo e o contexto atualizado
      setTimeout(() => {
        hasRedirected.current = true;
        // Usar window.location.href para forçar reload completo e garantir que o AuthContext seja atualizado
        window.location.href = "/";
      }, 150);
    } else {
      hasRedirected.current = true;
      router.replace("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}


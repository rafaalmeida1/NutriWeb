"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateInvite() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3055"}/invites/accept/${token}`
        );
        if (response.ok) {
          setValid(true);
          // Redirecionar para login com o token do convite
          setTimeout(() => {
            router.push(`/login?invite=${token}`);
          }, 2000);
        } else {
          setError("Convite inválido ou expirado");
        }
      } catch (err) {
        setError("Erro ao validar convite");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      validateInvite();
    }
  }, [token, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Voltar para login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">✓</span>
        </div>
        <h2 className="mt-6 text-2xl font-bold">Convite válido!</h2>
        <p className="mt-2 text-muted-foreground">Redirecionando para login...</p>
      </div>
    </div>
  );
}


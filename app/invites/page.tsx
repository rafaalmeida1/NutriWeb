"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Mail, User, Calendar, CheckCircle, XCircle, Clock, Trash2, Send, X } from "lucide-react";

interface Invite {
  id: string;
  email: string;
  name: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
}

export default function InvitesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Não redirecionar imediatamente, dar tempo para o contexto carregar
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        if (!user) {
          router.push("/login");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    if (!authLoading && user && !isAdmin) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchInvites();
    }
  }, [isAdmin]);

  async function fetchInvites() {
    try {
      const data = await api.getInvites();
      setInvites(data);
    } catch (error: any) {
      console.error("Erro ao carregar convites:", {
        message: error?.message,
        statusCode: error?.statusCode,
        fullError: error,
      });
      
      if (error?.statusCode === 401) {
        alert("Sessão expirada. Faça login novamente.");
        router.push("/login");
      } else if (error?.statusCode === 403) {
        alert("Você não tem permissão para acessar esta página.");
        router.push("/");
      } else {
        const errorMsg = error?.message || "Erro ao carregar convites. Tente novamente.";
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createInvite({
        email,
        name,
        customMessage: customMessage || undefined,
      });
      setShowDialog(false);
      setEmail("");
      setName("");
      setCustomMessage("");
      fetchInvites();
    } catch (error: any) {
      console.error("Erro ao criar convite:", error);
      alert(error.message || "Erro ao criar convite");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar este convite?")) return;

    try {
      await api.deleteInvite(id);
      fetchInvites();
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      alert("Erro ao cancelar convite");
    }
  };

  const handleResend = async (id: string) => {
    try {
      await api.resendInvite(id);
      alert("Convite reenviado com sucesso!");
      fetchInvites();
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      alert("Erro ao reenviar convite");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "expired":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Aceito";
      case "expired":
        return "Expirado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Pendente";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-base sm:text-lg font-bold text-primary-foreground">N</span>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-semibold tracking-wide text-primary">
              Nutri Thata
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Gerenciar Convites</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4" onClick={() => router.push("/")}>
            <span className="hidden sm:inline">Voltar</span>
            <span className="sm:hidden">←</span>
          </Button>
          <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4" onClick={() => setShowDialog(true)}>
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Novo Convite</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Convites de Pacientes</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie os convites enviados para pacientes acessarem o portal
            </p>
          </div>

          {invites.length === 0 ? (
            <div className="text-center py-8 sm:py-12 border border-border rounded-lg bg-card px-4">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Nenhum convite criado ainda</p>
              <Button onClick={() => setShowDialog(true)} size="sm" className="text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Convite
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="border border-border rounded-lg bg-card p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-semibold truncate">{invite.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invite.status)}
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {getStatusText(invite.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{invite.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">Expira em: {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                    {invite.status === "pending" && (
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm flex-1 sm:flex-initial"
                          onClick={() => handleResend(invite.id)}
                        >
                          <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Reenviar</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs sm:text-sm flex-1 sm:flex-initial"
                          onClick={() => handleDelete(invite.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialog de Criar Convite */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-background shadow-lg my-4">
            <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold">Novo Convite</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setShowDialog(false)}>
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: João Silva"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Email do Paciente *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="paciente@exemplo.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  Mensagem Personalizada (Opcional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  placeholder="Digite uma mensagem personalizada para o paciente..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Esta mensagem será incluída no email de convite
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? "Enviando..." : "Enviar Convite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

export default function BannersPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchBanner();
    }
  }, [isAdmin]);

  async function fetchBanner() {
    try {
      const response = await api.getHomeBanner();
      setBannerUrl(response.bannerUrl);
    } catch (error: any) {
      console.error("Erro ao carregar banner:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleBannerUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      if (result?.url) {
        await api.setHomeBanner(result.url);
        await fetchBanner();
        alert("Banner atualizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload do banner:", error);
      alert(error?.message || "Erro ao fazer upload do banner");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!confirm("Tem certeza que deseja remover o banner da página principal?")) return;
    
    try {
      await api.removeHomeBanner();
      await fetchBanner();
      alert("Banner removido com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover banner:", error);
      alert("Erro ao remover banner");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Banner da Página Principal
          </h1>
          <p className="text-muted-foreground">
            Configure o banner que aparece no topo da página inicial (estilo Netflix)
          </p>
        </div>

        {/* Banner Preview */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl mb-6">
          <div className="relative h-[400px] bg-gradient-to-br from-muted to-muted/50">
            {bannerUrl ? (
              <>
                <img
                  src={bannerUrl}
                  alt="Banner da página principal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 w-fit">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Banner Ativo</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <ImageIcon className="h-20 w-20 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">Nenhum banner configurado</p>
                <p className="text-muted-foreground/70 text-sm">
                  Adicione um banner para aparecer no topo da página principal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciar Banner</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload de Banner (Recomendado: 1920x1080px)
                </label>
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBannerUpload(file);
                  }}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  variant="default"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => {
                    const input = document.getElementById('banner-upload');
                    if (input) input.click();
                  }}
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : bannerUrl ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Trocar Banner
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Banner
                    </>
                  )}
                </Button>
              </div>

              {bannerUrl && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveBanner}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Banner
                </Button>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Dica:</strong> Use imagens com resolução 1920x1080px (16:9) para melhor visualização. 
                  O banner aparecerá no topo da página principal com estilo Netflix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

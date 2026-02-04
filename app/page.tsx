"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentCarousel } from "@/components/content-carousel";
import { PdfViewer } from "@/components/pdf-viewer";
import { AddEbookCard } from "@/components/add-ebook-card";
import { EbookDialog } from "@/components/ebook-dialog";
import { useAuth } from "@/contexts/auth-context";
import { api, type Ebook } from "@/lib/api";
import { Users, LogOut, Image as ImageIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeBanner, setHomeBanner] = useState<string | null>(null);
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    ebookId: string;
    title: string;
  } | null>(null);
  const [ebookDialog, setEbookDialog] = useState<{
    isOpen: boolean;
    ebook?: Ebook | null;
  }>({ isOpen: false });

  useEffect(() => {
    // Aguardar um pouco mais para garantir que o AuthContext tenha tempo de carregar
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        // Verificar novamente o localStorage diretamente antes de redirecionar
        const token = localStorage.getItem("auth_token");
        if (!token && !user) {
          router.replace("/login");
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEbooks();
      fetchHomeBanner();
    }
  }, [user]);

  async function fetchEbooks() {
    try {
      const ebooksData = await api.getEbooks();
      setEbooks(ebooksData);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      if (error?.statusCode === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchHomeBanner() {
    try {
      const response = await api.getHomeBanner();
      setHomeBanner(response.bannerUrl);
    } catch (error: any) {
      console.error("Erro ao carregar banner:", error);
    }
  }

  const handleItemClick = (item: { id: string; title: string; image: string; type: "video" | "ebook" }) => {
    // Apenas processar se for e-book
    if (item.type === "ebook") {
      const ebook = ebooks.find(e => e.id === item.id);
      if (ebook) {
        setPdfViewer({
          isOpen: true,
          ebookId: ebook.id,
          title: ebook.title,
        });
      }
    }
  };

  const handleAddEbook = () => {
    setEbookDialog({ isOpen: true, ebook: null });
  };

  const handleEditEbook = (item: { id: string; title: string; image: string; type: "video" | "ebook" }) => {
    // Apenas processar se for e-book
    if (item.type === "ebook") {
      const ebook = ebooks.find(e => e.id === item.id);
      if (ebook) {
        setEbookDialog({ isOpen: true, ebook });
      }
    }
  };


  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg ring-2 ring-primary/20">
              <span className="text-base sm:text-lg font-bold text-primary-foreground">N</span>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Nutri Thata
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Portal do Paciente</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/banners")}
                  className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                  title="Banners"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Banners</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/invites")}
                  className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                  title="Convites"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Convites</span>
                </Button>
                <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 hidden sm:inline-block">
                  Administrador
                </span>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-9 w-9 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Banner da Página Principal (Netflix Style) */}
      {homeBanner && (
        <div className="relative w-full h-[30vh] sm:h-[35vh] md:h-[40vh] min-h-[180px] sm:min-h-[220px] md:min-h-[280px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${homeBanner})`,
            }}
          >
            {/* Multiple Gradient Overlays for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
          </div>
          
          <div className="relative z-10 h-full flex items-end">
            <div className="container px-4 sm:px-6 pb-4 sm:pb-6 md:pb-8 max-w-5xl">
              <div className="space-y-2 sm:space-y-3 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground drop-shadow-2xl leading-tight">
                  Bem-vindo ao Nutri Thata
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-foreground/90 max-w-xl drop-shadow-lg font-medium">
                  Explore nossos e-books e conteúdos exclusivos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 py-6 sm:py-8 md:py-12">
        <div className="container px-4 sm:px-6">
          <ContentCarousel
            title="E-books"
            items={ebooks.map((e) => ({
              id: e.id,
              title: e.title,
              image: e.coverUrl || "/placeholder.svg",
              type: "ebook" as const,
            }))}
            variant="ebook"
            onItemClick={handleItemClick}
            onEdit={isAdmin ? handleEditEbook : undefined}
            onDelete={isAdmin ? async (id) => {
              if (confirm("Tem certeza que deseja excluir este e-book?")) {
                try {
                  await api.deleteEbook(id);
                  await fetchEbooks();
                } catch (error: any) {
                  console.error("Erro ao excluir:", error);
                  if (error?.statusCode === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                    router.push("/login");
                  } else if (error?.statusCode === 403) {
                    alert("Você não tem permissão para esta ação.");
                  } else {
                    alert(error?.message || "Erro ao excluir e-book");
                  }
                }
              }
            } : undefined}
            addButton={isAdmin ? <AddEbookCard onClick={handleAddEbook} /> : undefined}
          />
        </div>
      </main>

      {/* PDF Viewer */}
      {pdfViewer?.isOpen && (
        <PdfViewer
          ebookId={pdfViewer.ebookId}
          title={pdfViewer.title}
          onClose={() => setPdfViewer(null)}
        />
      )}

      {/* E-book Dialog */}
      {ebookDialog.isOpen && (
        <EbookDialog
          ebook={ebookDialog.ebook}
          isOpen={ebookDialog.isOpen}
          onClose={() => setEbookDialog({ isOpen: false })}
          onSave={fetchEbooks}
        />
      )}
    </div>
  );
}

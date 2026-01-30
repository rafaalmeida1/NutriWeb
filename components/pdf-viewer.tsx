"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configurar worker do PDF.js - usar jsdelivr que é mais confiável
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  ebookId: string;
  title: string;
  onClose: () => void;
}

export function PdfViewer({ ebookId, title, onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getEbookPdfUrl(ebookId);
        if (response?.url) {
          setPdfUrl(response.url);
        } else {
          setError("URL do PDF não encontrada");
        }
      } catch (err: any) {
        console.error("Erro ao carregar PDF:", {
          message: err?.message,
          statusCode: err?.statusCode,
          fullError: err,
        });
        const errorMsg = err?.message || "Erro ao carregar o PDF";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadPdf();
  }, [ebookId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Erro ao carregar documento:", error);
    setError("Erro ao carregar o documento PDF");
  }

  const handleDownload = async () => {
    if (!pdfUrl) return;
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando PDF...</div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="text-destructive mb-4">{error || "PDF não encontrado"}</div>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-medium text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Página {pageNumber} {numPages ? `de ${numPages}` : ""}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Baixar</span>
        </Button>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div className="mx-auto max-w-4xl">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Carregando documento...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8">
                <div className="text-destructive">Erro ao carregar o PDF</div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
              width={Math.min(800, typeof window !== "undefined" ? window.innerWidth - 64 : 800)}
            />
          </Document>
        </div>
      </div>

      {/* Footer Navigation */}
      {numPages && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Button
            variant="outline"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            {pageNumber} / {numPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="gap-2 bg-transparent"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

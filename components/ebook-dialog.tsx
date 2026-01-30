"use client";

import { useState, useEffect } from "react";
import { X, Users, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Ebook, Patient } from "@/lib/api";

interface EbookDialogProps {
  ebook?: Ebook | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EbookDialog({ ebook, isOpen, onClose, onSave }: EbookDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [visibleToAll, setVisibleToAll] = useState(true);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTitle(ebook?.title || "");
      setDescription(ebook?.description || "");
      setCoverUrl(ebook?.coverUrl || "");
      setPdfUrl(ebook?.pdfUrl || "");
      setPublished(ebook?.published || false);
      setVisibleToAll(ebook?.visibleToAll ?? true);
      setSelectedPatients(ebook?.visibleToUsers?.map(u => u.id) || []);
      
      // Load patients
      loadPatients();
    }
  }, [isOpen, ebook]);

  async function loadPatients() {
    setLoadingPatients(true);
    try {
      const patientsData = await api.getPatients();
      setPatients(patientsData);
    } catch (error: any) {
      console.error("Erro ao carregar pacientes:", error);
      alert("Erro ao carregar lista de pacientes");
    } finally {
      setLoadingPatients(false);
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const result = await api.uploadImage(file);
      if (result?.url) {
        setCoverUrl(result.url);
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload da capa:", error);
      alert(error?.message || "Erro ao fazer upload da capa");
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const result = await api.uploadPdf(file);
      if (result?.url) {
        setPdfUrl(result.url);
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload do PDF:", error);
      alert(error?.message || "Erro ao fazer upload do PDF");
    } finally {
      setUploadingPdf(false);
    }
  };

  const togglePatient = (patientId: string) => {
    setSelectedPatients(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("O título é obrigatório");
      return;
    }

    if (!pdfUrl.trim()) {
      alert("O PDF é obrigatório");
      return;
    }

    setLoading(true);

    try {
      if (ebook) {
        // Update: incluir published
        const updateData = {
          title: title.trim(),
          description: description.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          pdfUrl: pdfUrl.trim() || undefined,
          published,
          visibleToAll,
          visibleToUserIds: visibleToAll ? [] : selectedPatients,
        };
        await api.updateEbook(ebook.id, updateData);
      } else {
        // Create: incluir published
        const createData = {
          title: title.trim(),
          description: description.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          pdfUrl: pdfUrl.trim() || undefined,
          published: published,
          visibleToAll,
          visibleToUserIds: visibleToAll ? [] : selectedPatients,
        };
        await api.createEbook(createData);
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar e-book:", error);
      let errorMessage = error?.message || "Erro ao salvar e-book";
      // Se for array, juntar as mensagens
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', ');
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-background shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="text-xl font-bold">
            {ebook ? "Editar E-book" : "Adicionar E-book"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold mb-2">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Digite o título do e-book"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descrição do e-book"
            />
          </div>

          {/* Capa */}
          <div>
            <label className="block text-sm font-semibold mb-2">Capa</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="URL da capa ou faça upload"
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              />
              <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2.5 text-sm hover:bg-accent flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {uploadingCover ? "Enviando..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
            {coverUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border w-32">
                <img src={coverUrl} alt="Capa preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* PDF */}
          <div>
            <label className="block text-sm font-semibold mb-2">PDF *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="URL do PDF ou faça upload"
                required
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
              />
              <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2.5 text-sm hover:bg-accent flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {uploadingPdf ? "Enviando..." : "Upload"}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Visibilidade */}
          <div className="border-t border-border pt-6">
            <label className="block text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Visibilidade
            </label>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="visibleToAll"
                  name="visibility"
                  checked={visibleToAll}
                  onChange={() => {
                    setVisibleToAll(true);
                    setSelectedPatients([]);
                  }}
                  className="h-4 w-4"
                />
                <label htmlFor="visibleToAll" className="text-sm font-medium cursor-pointer">
                  Visível para todos os pacientes
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="visibleToSelected"
                  name="visibility"
                  checked={!visibleToAll}
                  onChange={() => setVisibleToAll(false)}
                  className="h-4 w-4"
                />
                <label htmlFor="visibleToSelected" className="text-sm font-medium cursor-pointer">
                  Visível apenas para pacientes selecionados
                </label>
              </div>

              {!visibleToAll && (
                <div className="ml-7 mt-3 p-4 rounded-lg border border-border bg-muted/30 max-h-60 overflow-y-auto">
                  {loadingPatients ? (
                    <div className="text-sm text-muted-foreground">Carregando pacientes...</div>
                  ) : patients.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Nenhum paciente cadastrado</div>
                  ) : (
                    <div className="space-y-2">
                      {patients.map((patient) => (
                        <label
                          key={patient.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={() => togglePatient(patient.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm flex-1">{patient.email}</span>
                          {selectedPatients.includes(patient.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Publicado */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="published" className="text-sm font-medium cursor-pointer">
              Publicado (visível para pacientes)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
              <Button type="submit" disabled={loading || uploadingCover || uploadingPdf}>
              {loading ? "Salvando..." : "Salvar E-book"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

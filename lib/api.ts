const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3055';

export interface ApiError {
  message: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Recarregar token antes de cada requisição (pode ter mudado)
    this.loadToken();
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        try {
          const payload = JSON.parse(atob(this.token.split('.')[1]));
          console.log(`🔑 Enviando token para ${endpoint} - User: ${payload.email} (${payload.role}) - ID: ${payload.sub}`);
        } catch (e) {
          // Ignorar erro de parse
        }
      }
    } else {
      console.warn(`⚠️  Requisição sem token para: ${endpoint}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

        if (!response.ok) {
          let errorMessage = 'Erro na requisição';
          let errorDetails: any = null;
          
          try {
            const text = await response.text();
            if (text) {
              try {
                const errorData = JSON.parse(text);
                // Tratar array de mensagens (validação do class-validator)
                if (Array.isArray(errorData.message)) {
                  errorMessage = errorData.message.join(', ');
                } else {
                  errorMessage = errorData.message || errorData.error || errorMessage;
                }
                errorDetails = errorData;
              } catch {
                // Se não for JSON, usar o texto como mensagem
                errorMessage = text || errorMessage;
              }
            }
          } catch {
            // Se falhar tudo, usar mensagem padrão
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
          
          const error: ApiError = {
            message: errorMessage,
            statusCode: response.status,
            ...(errorDetails ? { details: errorDetails } : {}),
          };
          console.error(`API Error (${response.status}) for ${endpoint}:`, error);
          throw error;
        }

      return await response.json();
    } catch (error: any) {
      // Se já é um objeto de erro formatado, re-lançar
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }
      
      // Se for Error do JavaScript, converter
      if (error instanceof Error) {
        throw { 
          message: error.message || 'Erro na requisição', 
          statusCode: 500 
        };
      }
      
      // Caso padrão
      throw { 
        message: 'Erro desconhecido na requisição', 
        statusCode: 500 
      };
    }
  }

  // Auth
  async loginAdmin(email: string, password: string) {
    const response = await this.request<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.accessToken);
    return response;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request<{ accessToken: string }>(
      '/auth/admin/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
    );
    this.setToken(response.accessToken);
    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Contents
  async getContents(type?: 'video' | 'article' | 'material') {
    const query = type ? `?type=${type}` : '';
    return this.request<Content[]>(`/contents${query}`);
  }

  async getContent(id: string) {
    return this.request<Content>(`/contents/${id}`);
  }

  // Ebooks
  async getEbooks() {
    return this.request<Ebook[]>(`/ebooks`);
  }

  async getEbook(id: string) {
    return this.request<Ebook>(`/ebooks/${id}`);
  }

  async getEbookPdfUrl(id: string) {
    try {
      const response = await this.request<{ url: string }>(`/ebooks/${id}/pdf`);
      return response;
    } catch (error: any) {
      console.error("Erro na API ao buscar URL do PDF:", error);
      throw {
        message: error?.message || "Erro ao carregar PDF",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  // Admin methods
  async createEbook(data: {
    title: string;
    description?: string;
    coverUrl?: string;
    pdfUrl?: string;
    published?: boolean;
    visibleToAll?: boolean;
    visibleToUserIds?: string[];
  }) {
    try {
      const response = await this.request<Ebook>("/ebooks", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      console.error("Erro na API ao criar e-book:", error);
      throw {
        message: error?.message || "Erro ao criar e-book",
        statusCode: error?.statusCode || 500,
      };
    }
  }

    async updateEbook(id: string, data: {
      title?: string;
      description?: string;
      coverUrl?: string;
      pdfUrl?: string;
      bannerUrl?: string;
      published?: boolean;
      visibleToAll?: boolean;
      visibleToUserIds?: string[];
    }) {
    try {
      const response = await this.request<Ebook>(`/ebooks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      console.error("Erro na API ao atualizar e-book:", error);
      throw {
        message: error?.message || "Erro ao atualizar e-book",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  async deleteEbook(id: string) {
    try {
      await this.request<void>(`/ebooks/${id}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      console.error("Erro na API ao excluir e-book:", error);
      throw {
        message: error?.message || "Erro ao excluir e-book",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const token = this.token;
    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw await response.json();
    }

    return response.json() as Promise<{ url: string }>;
  }

  async uploadPdf(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const token = this.token;
    const response = await fetch(`${this.baseUrl}/upload/pdf`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw await response.json();
    }

    return response.json() as Promise<{ url: string }>;
  }

  // Invites
  async getInvites() {
    try {
      const response = await this.request<Invite[]>("/invites");
      return response;
    } catch (error: any) {
      console.error("Erro na API ao buscar convites:", {
        message: error?.message,
        statusCode: error?.statusCode,
        error: error,
      });
      throw {
        message: error?.message || "Erro ao carregar convites",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  async createInvite(data: { email: string; name: string; customMessage?: string }) {
    return this.request<Invite>("/invites", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteInvite(id: string) {
    return this.request<void>(`/invites/${id}`, {
      method: "DELETE",
    });
  }

  async resendInvite(id: string) {
    return this.request<Invite>(`/invites/${id}/resend`, {
      method: "POST",
    });
  }

  // Patients
  async getPatients() {
    try {
      const response = await this.request<Patient[]>("/patients");
      return response;
    } catch (error: any) {
      console.error("Erro na API ao buscar pacientes:", error);
      throw {
        message: error?.message || "Erro ao carregar pacientes",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  // Settings
  async getHomeBanner() {
    try {
      const response = await this.request<{ bannerUrl: string | null }>("/settings/home-banner");
      return response;
    } catch (error: any) {
      console.error("Erro na API ao buscar banner:", error);
      throw {
        message: error?.message || "Erro ao carregar banner",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  async setHomeBanner(bannerUrl: string) {
    try {
      const response = await this.request<{ bannerUrl: string }>("/settings/home-banner", {
        method: "POST",
        body: JSON.stringify({ bannerUrl }),
      });
      return response;
    } catch (error: any) {
      console.error("Erro na API ao definir banner:", error);
      throw {
        message: error?.message || "Erro ao definir banner",
        statusCode: error?.statusCode || 500,
      };
    }
  }

  async removeHomeBanner() {
    try {
      await this.request<void>("/settings/home-banner", {
        method: "DELETE",
      });
    } catch (error: any) {
      console.error("Erro na API ao remover banner:", error);
      throw {
        message: error?.message || "Erro ao remover banner",
        statusCode: error?.statusCode || 500,
      };
    }
  }
}

export interface Invite {
  id: string;
  email: string;
  name: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'material';
  thumbnailUrl?: string;
  contentUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ebook {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  bannerUrl?: string;
  published: boolean;
  visibleToAll: boolean;
  visibleToUsers?: Array<{ id: string; email: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  email: string;
  role: 'patient';
  createdAt: string;
}

export const api = new ApiClient(API_URL);


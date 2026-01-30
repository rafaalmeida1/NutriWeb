export interface Content {
  id: string;
  title: string;
  image: string;
  type: "video" | "ebook";
}

export const videos: Content[] = [
  {
    id: "v1",
    title: "Introducao a Nutricao",
    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=400&h=300&fit=crop",
    type: "video",
  },
  {
    id: "v2",
    title: "Guia de Industrializados",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    type: "video",
  },
  {
    id: "v3",
    title: "Cafe da Manha Saudavel",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
    type: "video",
  },
  {
    id: "v4",
    title: "Suplementacao Inteligente",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop",
    type: "video",
  },
  {
    id: "v5",
    title: "Alimentos Termogenicos",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    type: "video",
  },
];

export const ebooks: Content[] = [
  {
    id: "e1",
    title: "Delivery Estrategico",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=400&fit=crop",
    type: "ebook",
  },
  {
    id: "e2",
    title: "Guia de Industrializados",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=400&fit=crop",
    type: "ebook",
  },
  {
    id: "e3",
    title: "Guia de Suplementos",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&h=400&fit=crop",
    type: "ebook",
  },
  {
    id: "e4",
    title: "Cafe da Manha",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&h=400&fit=crop",
    type: "ebook",
  },
  {
    id: "e5",
    title: "Receitas Low Carb",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=400&fit=crop",
    type: "ebook",
  },
  {
    id: "e6",
    title: "Alimentacao Funcional",
    image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=300&h=400&fit=crop",
    type: "ebook",
  },
];

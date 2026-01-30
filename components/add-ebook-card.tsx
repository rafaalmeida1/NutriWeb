"use client";

import { Plus } from "lucide-react";

interface AddEbookCardProps {
  onClick: () => void;
}

export function AddEbookCard({ onClick }: AddEbookCardProps) {
  return (
    <div className="flex-shrink-0 w-36 sm:w-44 md:w-48 h-[280px] sm:h-[340px] md:h-[400px]">
      <button
        onClick={onClick}
        className="group flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-card to-muted/30 transition-all duration-300 hover:border-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      >
      <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/60 bg-muted/30 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110">
        <Plus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="text-center space-y-1 px-2">
        <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          Adicionar E-book
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Criar novo conteúdo
        </p>
      </div>
      </button>
    </div>
  );
}

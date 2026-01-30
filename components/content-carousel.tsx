"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Edit, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselItem {
  id: string;
  title: string;
  image: string;
  type: "video" | "ebook";
}

interface ContentCarouselProps {
  title: string;
  items: CarouselItem[];
  variant: "video" | "ebook";
  onItemClick: (item: CarouselItem) => void;
  onEdit?: (item: CarouselItem) => void;
  onDelete?: (id: string) => void;
  addButton?: React.ReactNode;
}

export function ContentCarousel({
  title,
  items,
  variant,
  onItemClick,
  onEdit,
  onDelete,
  addButton,
}: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      // Scroll amount adaptável para mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const scrollAmount = direction === "left" ? (isMobile ? -280 : -400) : (isMobile ? 280 : 400);
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Items */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", alignItems: "stretch", WebkitOverflowScrolling: "touch" }}
        >
          {addButton && addButton}
          {items.map((item) => {
            // Calcular altura e largura baseada no aspect ratio e responsividade
            const cardWidth = variant === "ebook" ? "w-36 sm:w-44 md:w-48" : "w-56 sm:w-60 md:w-64";
            const cardHeight = variant === "ebook" ? "h-[280px] sm:h-[340px] md:h-[400px]" : "h-[200px] sm:h-[240px] md:h-[280px]";
            return (
            <div
              key={item.id}
              className={`flex-shrink-0 ${cardWidth} ${cardHeight} snap-start`}
            >
              <div className="group relative h-full flex flex-col rounded-lg sm:rounded-xl border border-border/50 bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <button
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="w-full h-full flex flex-col overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  <div
                    className={`relative overflow-hidden flex-shrink-0 ${variant === "ebook" ? "aspect-[3/4]" : "aspect-video"} rounded-t-xl bg-muted/30`}
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Play Button for Videos */}
                    {variant === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                          <Play className="h-8 w-8 ml-1 text-foreground fill-foreground" />
                        </div>
                      </div>
                    )}

                    {/* E-book Badge */}
                    {variant === "ebook" && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        E-book
                      </div>
                    )}
                  </div>
                  
                  {/* Title Card */}
                  <div className="mt-auto pt-2 sm:pt-3 space-y-1 px-2 sm:px-3 pb-2 sm:pb-3 flex-shrink-0 min-h-[50px] sm:min-h-[60px] flex flex-col justify-end bg-card">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 text-left group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
                  </div>
                </button>

                {/* Action Buttons */}
                {(onEdit || onDelete) && (
                  <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
                    {onEdit && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg hover:bg-accent hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-destructive/90 backdrop-blur-md border border-destructive shadow-lg hover:bg-destructive hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

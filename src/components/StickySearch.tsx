import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';
import { useShallow } from 'zustand/react/shallow';
interface StickySearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
  resultsCount: number;
}
export function StickySearch({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  showFavoritesOnly,
  onToggleFavorites,
  favoriteCount,
  resultsCount,
}: StickySearchProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileExpanded, setMobileExpanded] = useState(false);
  const isMobile = useIsMobile();
  const categorizedFeeds = useFeedsStore(useShallow(s => s.categorizedFeeds));
  const categories = useMemo(() => Object.keys(categorizedFeeds), [categorizedFeeds]);
  useIntersectionObserver(searchRef, () => setIsVisible(true), {
    rootMargin: '-10% 0px -20% 0px',
    once: true,
  });
  const showCategoryFilter = !isMobile || isMobileExpanded;
  return (
    <div ref={searchRef} role="search" className="sticky top-1 sm:top-2 z-50 mb-8 h-11">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative max-w-3xl mx-auto backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg p-1.5"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search feeds..."
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 h-8 text-base rounded-lg bg-transparent border-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300",
                    isMobile && !isMobileExpanded && "pr-10"
                  )}
                  aria-label="Search feeds"
                />
              </div>
              <AnimatePresence>
                {showCategoryFilter && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                      <SelectTrigger className="h-8 w-[180px] sm:w-[200px] text-sm rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleFavorites}
                      className={cn(
                        "h-8 w-8 rounded-lg flex-shrink-0",
                        showFavoritesOnly && "bg-yellow-400/20 hover:bg-yellow-400/30"
                      )}
                      aria-label="Toggle favorites filter"
                    >
                      <Star className={cn("h-5 w-5 transition-colors", showFavoritesOnly ? 'text-yellow-500 fill-yellow-400' : 'text-muted-foreground')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Toggle Favorites</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileExpanded(!isMobileExpanded)}
                  className="h-8 w-8 rounded-lg flex-shrink-0"
                  aria-expanded={isMobileExpanded}
                  aria-label={isMobileExpanded ? "Collapse filters" : "Expand filters"}
                >
                  {isMobileExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              )}
            </div>
            <div aria-live="polite" className="sr-only">
              {resultsCount} {resultsCount === 1 ? 'result' : 'results'} found.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
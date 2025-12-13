import React, { useState, useMemo, useRef, useEffect, useCallback, forwardRef } from "react";
import { Download, Search, Info, X, Settings, Edit3 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { generateAndDownloadOpml } from "@/lib/opml-generator";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePrivacyStore } from "@/stores/usePrivacyStore";
import { useFeedsStore } from "@/stores/useFeedsStore";
import { Feed } from "@/data/feeds";
import { useHealthStore } from "@/stores/useHealthStore";
import { PrivacySettingsSheet } from "@/components/PrivacySettingsSheet";
import { EditFeedsSheet } from "@/components/EditFeedsSheet";
import { FeedCard } from "@/components/feed-card";
import { motion, AnimatePresence } from "framer-motion";
type LazySectionProps = {
  category: string;
  feeds: any[];
  searchQuery: string;
  isFavorite: (url: string) => boolean;
  onToggleFavorite: (url: string) => void;
};
const LazySection = forwardRef<HTMLDivElement, LazySectionProps>(
  ({ category, feeds, searchQuery, isFavorite, onToggleFavorite }, ref) => {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    return (
      <div ref={ref}>
        <motion.section
          id={category.replace(/\s+/g, '-').toLowerCase()}
          className="bg-white/90 dark:bg-slate-800/70 border border-gray-200/50 dark:border-slate-700/50 shadow-md p-6 md:p-8 rounded-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900 pb-3 mb-6">
            {category}
          </h2>
          <motion.div
            className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {feeds.map((feed) => (
              <FeedCard
                key={feed.url}
                feed={feed}
                searchQuery={searchQuery}
                isFavorite={isFavorite(feed.url)}
                onToggleFavorite={onToggleFavorite}
                category={feed.category}
              />
            ))}
          </motion.div>
        </motion.section>
      </div>
    );
  }
);
LazySection.displayName = 'LazySection';
interface ScoredFeed {
  feed: Feed;
  category: string;
  score: number;
}
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [isPrivacySheetOpen, setPrivacySheetOpen] = useState(false);
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const storageMode = usePrivacyStore(s => s.storageMode);
  const favoriteUrls = useFavoritesStore(s => s.favoriteUrls);
const isFavorite = useFavoritesStore(s => s.isFavorite);
const toggleFavorite = useFavoritesStore(s => s.toggleFavorite);
const getFavoriteFeeds = useFavoritesStore(s => s.getFavoriteFeeds);
const showFavoritesOnly = useFavoritesStore(s => s.showFavoritesOnly);
const toggleShowFavoritesOnly = useFavoritesStore(s => s.toggleShowFavoritesOnly);
const loadFavorites = useFavoritesStore(s => s.loadFromStorage);
  const healthChecksEnabled = usePrivacyStore(s => s.healthChecksEnabled);
  const categorizedFeeds = useFeedsStore(s => s.categorizedFeeds);
const getFlatFeeds = useFeedsStore(s => s.getFlatFeeds);
const loadFeeds = useFeedsStore(s => s.loadFromStorage);
  const checkHealth = useHealthStore(s => s.checkHealth);
const loadHealth = useHealthStore(s => s.loadFromStorage);
  useEffect(() => {
    loadFeeds();
    loadFavorites();
    loadHealth();
  }, [storageMode, loadFeeds, loadFavorites, loadHealth]);
  useEffect(() => {
    if (healthChecksEnabled) {
      const allUrls = getFlatFeeds().map(f => f.url);
      if (allUrls.length > 0) {
        checkHealth(allUrls);
      }
    }
  }, [healthChecksEnabled, checkHealth, getFlatFeeds]);
  const boundIsFavorite = useCallback((url: string) => isFavorite(url), [isFavorite]);
  const boundToggleFavorite = useCallback((url: string) => toggleFavorite(url), [toggleFavorite]);
  const { paginatedResults, totalPages, searchResultCount } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { paginatedResults: [], totalPages: 0, searchResultCount: 0 };
    }
    const sourceFeeds = showFavoritesOnly ? getFavoriteFeeds() : getFlatFeeds();
    const queryTokens = searchQuery.toLowerCase().split(' ').filter(Boolean);
    const scoredFeeds: ScoredFeed[] = [];
    const sourceMap = showFavoritesOnly ? { "Favorites": sourceFeeds } : categorizedFeeds;
    Object.entries(sourceMap).forEach(([category, feeds]) => {
      feeds.forEach(feed => {
        let score = 0;
        const titleLower = feed.title.toLowerCase();
        const urlLower = feed.url.toLowerCase();
        queryTokens.forEach(token => {
          if (titleLower.includes(token)) score += 2;
          if (urlLower.includes(token)) score += 1;
        });
        if (score > 0) {
          scoredFeeds.push({ feed, category, score });
        }
      });
    });
    scoredFeeds.sort((a, b) => b.score - a.score);
    const total = scoredFeeds.length;
    const pages = Math.ceil(total / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      paginatedResults: scoredFeeds.slice(start, end).map(item => ({ ...item.feed, category: item.category })),
      totalPages: pages,
      searchResultCount: total,
    };
  }, [searchQuery, showFavoritesOnly, getFavoriteFeeds, getFlatFeeds, categorizedFeeds, currentPage]);
  const categorizedAndFilteredFeeds = useMemo(() => {
    if (searchQuery.trim()) return {};
    const sourceFeeds = showFavoritesOnly ? { "Favorites": getFavoriteFeeds() } : categorizedFeeds;
    return sourceFeeds;
  }, [searchQuery, showFavoritesOnly, getFavoriteFeeds, categorizedFeeds]);
  const totalFeeds = useMemo(() => getFlatFeeds().length, [getFlatFeeds]);
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <main id="main-content" role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16">
            <header className="text-center mb-10 animate-fade-in backdrop-blur-sm bg-white/80 dark:bg-slate-800/70 border border-gray-200/50 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-md">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                LV Intelligence <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">Feed Index</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                {totalFeeds}+ Categorized RSS/Atom Feeds for the Lehigh Valley Region
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                 <Button onClick={generateAndDownloadOpml} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500" size="lg">
                    <Download className="mr-2 h-5 w-5" /> Download Full OPML
                  </Button>
                  <Button onClick={() => setEditSheetOpen(true)} variant="outline" size="lg" className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50">
                    <Edit3 className="mr-2 h-5 w-5" /> Edit Feeds
                  </Button>
                  <Button onClick={() => setPrivacySheetOpen(true)} variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50" aria-label="Privacy settings">
                    <Settings className="h-6 w-6" />
                  </Button>
              </div>
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl shadow-sm flex items-center justify-center gap-2 max-w-2xl mx-auto">
                <Info className="h-5 w-5 flex-shrink-0 text-indigo-800 dark:text-indigo-200" />
                <p className="font-medium text-sm text-indigo-800 dark:text-indigo-200">This is an index only. Use "Copy URL" to subscribe to feeds in your RSS reader.</p>
              </div>
            </header>
            <div id="search-section" role="search" className="sticky top-4 z-50 mb-10">
              <div className="relative max-w-2xl mx-auto backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg p-2">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input ref={searchInputRef} type="text" placeholder={`Search ${totalFeeds}+ feeds...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-10 py-3 h-12 text-base rounded-xl bg-transparent border-none focus:ring-2 focus:ring-indigo-500" aria-label="Search feeds" />
                    {searchQuery.length > 0 && (<Button onClick={handleClearSearch} variant="ghost" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500" aria-label="Clear search"><X className="h-4 w-4" /></Button>)}
                 </div>
                 <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50" onClick={toggleShowFavoritesOnly} onKeyDown={(e) => e.key === 'Enter' && toggleShowFavoritesOnly()} role="checkbox" aria-checked={showFavoritesOnly} tabIndex={0}>
                      <motion.div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${showFavoritesOnly ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`} animate={{ scale: showFavoritesOnly ? 1 : 0.9 }}>
                        {showFavoritesOnly && <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}><svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg></motion.div>}
                      </motion.div>
                      <Label htmlFor="favorites-only-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Show Favorites Only</Label>
                    </div>
                 </div>
              </div>
              {searchQuery && (<div className="text-center mt-2"><Badge variant="secondary">{searchResultCount} result{searchResultCount === 1 ? '' : 's'} found</Badge></div>)}
            </div>
            <div className="space-y-16 md:space-y-24">
              <AnimatePresence mode="wait">
                {searchQuery.trim() ? (
                  paginatedResults.length > 0 ? (
                    <motion.div key="search-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <LazySection category="Search Results" feeds={paginatedResults} searchQuery={searchQuery} isFavorite={boundIsFavorite} onToggleFavorite={boundToggleFavorite} />
                      {totalPages > 1 && (
                        <Pagination className="mt-8">
                          <PaginationContent>
                            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} /></PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <PaginationItem key={page}><PaginationLink href="#" isActive={currentPage === page} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>{page}</PaginationLink></PaginationItem>
                            ))}
                            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} /></PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="no-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                      <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{showFavoritesOnly ? "No favorite feeds match your search." : `No feeds found for "${searchQuery}"`}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">{showFavoritesOnly && favoriteUrls.length === 0 ? "You haven't favorited any feeds yet." : "Try a different search term."}</p>
                    </motion.div>
                  )
                ) : (
                  Object.entries(categorizedAndFilteredFeeds).map(([category, feeds]) => (
                    <LazySection key={category} category={category} feeds={feeds} searchQuery={searchQuery} isFavorite={boundIsFavorite} onToggleFavorite={boundToggleFavorite} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        <footer className="mt-12 py-6 border-t border-gray-200 dark:border-slate-700 text-center text-sm text-muted-foreground bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
          Built with ❤️ at Cloudflare | Data is stored in your browser's {storageMode === 'local' ? 'persistent' : 'session'} storage.
        </footer>
        <Toaster richColors position="top-right" />
        <PrivacySettingsSheet open={isPrivacySheetOpen} onOpenChange={setPrivacySheetOpen} />
        <EditFeedsSheet open={isEditSheetOpen} onOpenChange={setEditSheetOpen} />
      </div>
    </AppLayout>
  );
}
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
import { generateAndDownloadOpml } from "@/lib/opml-generator";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePrivacyStore } from "@/stores/usePrivacyStore";
import { useFeedsStore } from "@/stores/useFeedsStore";
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
    const observerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
      const element = observerRef.current;
      if (!element) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -100px 0px" }
      );
      observer.observe(element);
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }, []);
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    return (
      <div ref={ref}>
        <motion.section
          ref={observerRef}
          id={category.replace(/\s+/g, '-').toLowerCase()}
          className="bg-white/90 dark:bg-slate-800/70 border border-gray-200/50 dark:border-slate-700/50 shadow-md p-6 md:p-8 rounded-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900 pb-3 mb-6">
            {category}
          </h2>
          {!isVisible ? (
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="flex flex-col h-full bg-white/90 dark:bg-slate-800/80 border-gray-200/50 dark:border-slate-700/50">
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <Skeleton className="h-6 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="mt-auto flex items-center gap-2">
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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
                />
              ))}
            </motion.div>
          )}
        </motion.section>
      </div>
    );
  }
);
LazySection.displayName = 'LazySection';
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrivacySheetOpen, setPrivacySheetOpen] = useState(false);
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Stores
  const { favoriteUrls, isFavorite, toggleFavorite, getFavoriteFeeds, showFavoritesOnly, toggleShowFavoritesOnly, loadFromStorage } = useFavoritesStore();
  const enableLocalStorage = usePrivacyStore(s => s.enableLocalStorage);
  const healthChecksEnabled = usePrivacyStore(s => s.healthChecksEnabled);
  const categorizedFeeds = useFeedsStore(s => s.categorizedFeeds);
  const getFlatFeeds = useFeedsStore(s => s.getFlatFeeds);
  const checkHealth = useHealthStore(s => s.checkHealth);
  // Effect for initializing stores from localStorage based on privacy settings
  useEffect(() => {
    if (enableLocalStorage) {
      loadFromStorage();
      useFeedsStore.persist.rehydrate();
      useHealthStore.persist.rehydrate();
    }
  }, [enableLocalStorage, loadFromStorage]);
  // Effect for persisting favorites store
  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem('lv-feed-favorites-storage', JSON.stringify({ version: 0, state: { favoriteUrls, showFavoritesOnly } }));
    }
  }, [favoriteUrls, showFavoritesOnly, enableLocalStorage]);
  // Effect for triggering health checks on mount if enabled
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
  const filteredFeeds = useMemo(() => {
    const sourceFeeds = showFavoritesOnly ? { "Favorites": getFavoriteFeeds() } : categorizedFeeds;
    if (!searchQuery.trim()) {
      return sourceFeeds;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered: Record<string, any[]> = {};
    for (const category in sourceFeeds) {
      const matchingFeeds = sourceFeeds[category].filter(
        (feed) =>
          feed.title.toLowerCase().includes(lowercasedQuery) ||
          feed.url.toLowerCase().includes(lowercasedQuery)
      );
      if (matchingFeeds.length > 0) {
        filtered[category] = matchingFeeds;
      }
    }
    return filtered;
  }, [searchQuery, showFavoritesOnly, getFavoriteFeeds, categorizedFeeds]);
  const totalFeeds = useMemo(() => Object.values(categorizedFeeds).flat().length, [categorizedFeeds]);
  const searchResultCount = useMemo(() => Object.values(filteredFeeds).flat().length, [filteredFeeds]);
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);
  return (
    <AppLayout>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-white dark:focus:bg-slate-800 focus:p-2 focus:rounded-md focus:ring-2 focus:ring-indigo-500">
        Skip to main content
      </a>
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
                 <Button
                    onClick={generateAndDownloadOpml}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Full OPML
                  </Button>
                  <Button
                    onClick={() => setEditSheetOpen(true)}
                    variant="outline"
                    size="lg"
                    className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50"
                  >
                    <Edit3 className="mr-2 h-5 w-5" />
                    Edit Feeds
                  </Button>
                  <Button
                    onClick={() => setPrivacySheetOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50"
                    aria-label="Privacy settings"
                  >
                    <Settings className="h-6 w-6" />
                  </Button>
              </div>
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl shadow-sm flex items-center justify-center gap-2 max-w-2xl mx-auto">
                <Info className="h-5 w-5 flex-shrink-0 text-indigo-800 dark:text-indigo-200" />
                <p className="font-medium text-sm text-indigo-800 dark:text-indigo-200">
                  This is an index only. Use "Copy URL" to subscribe to feeds in your RSS reader.
                </p>
              </div>
            </header>
            <div id="search-section" role="search" className="sticky top-4 z-50 mb-10">
              <div className="relative max-w-2xl mx-auto backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg p-2">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`Search ${totalFeeds}+ feeds...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 h-12 text-base rounded-xl bg-transparent border-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Search feeds"
                    />
                    {searchQuery.length > 0 && (
                        <Button onClick={handleClearSearch} variant="ghost" size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500" aria-label="Clear search">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                 </div>
                 <div className="flex items-center justify-center pt-2">
                    <div
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50"
                      onClick={toggleShowFavoritesOnly}
                      onKeyDown={(e) => e.key === 'Enter' && toggleShowFavoritesOnly()}
                      role="checkbox"
                      aria-checked={showFavoritesOnly}
                      tabIndex={0}
                    >
                      <motion.div
                        className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${showFavoritesOnly ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}
                        animate={{ scale: showFavoritesOnly ? 1 : 0.9 }}
                      >
                        {showFavoritesOnly && <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}><svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg></motion.div>}
                      </motion.div>
                      <Label htmlFor="favorites-only-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Show Favorites Only</Label>
                    </div>
                 </div>
              </div>
              {searchQuery && (
                <div className="text-center mt-2">
                  <Badge variant="secondary">{searchResultCount} result{searchResultCount === 1 ? '' : 's'} found</Badge>
                </div>
              )}
            </div>
            <div className="space-y-16 md:space-y-24">
              <AnimatePresence mode="sync">
                {Object.keys(filteredFeeds).length > 0 ? (
                  Object.entries(filteredFeeds).map(([category, feeds]) => (
                    <LazySection
                      key={category}
                      category={category}
                      feeds={feeds}
                      searchQuery={searchQuery}
                      isFavorite={boundIsFavorite}
                      onToggleFavorite={boundToggleFavorite}
                    />
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      {showFavoritesOnly ? "No favorite feeds match your search." : `No feeds found for "${searchQuery}"`}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      {showFavoritesOnly && favoriteUrls.length === 0 ? "You haven't favorited any feeds yet. Click the star icon on a feed to add it." : "Try a different search term."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        <footer className="mt-12 py-6 border-t border-gray-200 dark:border-slate-700 text-center text-sm text-muted-foreground bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
          Built with ❤️ at Cloudflare | Fully client-side, no tracking. LocalStorage is optional (opt-in via settings).
        </footer>
        <Toaster richColors position="top-right" />
        <PrivacySettingsSheet open={isPrivacySheetOpen} onOpenChange={setPrivacySheetOpen} />
        <EditFeedsSheet open={isEditSheetOpen} onOpenChange={setEditSheetOpen} />
      </div>
    </AppLayout>
  );
}
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Download, Search, Info, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categorizedFeeds } from "@/data/feeds";
import { FeedCard } from "@/components/feed-card";
import { generateAndDownloadOpml } from "@/lib/opml-generator";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { motion, AnimatePresence } from "framer-motion";
const LazySection = ({ category, feeds, searchQuery, isFavorite, onToggleFavorite }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
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
    <motion.section
      ref={ref}
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
  );
};
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const favoriteUrls = useFavoritesStore(state => state.favoriteUrls);
  const isFavorite = useFavoritesStore(state => state.isFavorite);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const getFavoriteFeeds = useFavoritesStore(state => state.getFavoriteFeeds);
  const boundIsFavorite = useCallback((url: string) => isFavorite(url), [isFavorite]);
  const boundToggleFavorite = useCallback((url: string) => toggleFavorite(url), [toggleFavorite]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [searchQuery, showFavoritesOnly, favoriteUrls, getFavoriteFeeds]);
  const totalFeeds = useMemo(() => Object.values(categorizedFeeds).flat().length, []);
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
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button
                    onClick={generateAndDownloadOpml}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Full OPML
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
                 <div className="flex items-center justify-center space-x-2 pt-2">
                    <Checkbox id="favorites-only" checked={showFavoritesOnly} onCheckedChange={(checked) => setShowFavoritesOnly(!!checked)} />
                    <Label htmlFor="favorites-only" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Show Favorites Only</Label>
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
          Built with ❤️ at Cloudflare
        </footer>
        <Toaster richColors position="top-right" />
      </div>
    </AppLayout>
  );
}
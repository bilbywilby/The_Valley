<<<<<<< HEAD
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
              <AnimatePresence mode="wait">
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
=======
import React, { useState, useMemo, useRef, useEffect, useCallback, forwardRef } from "react";
import { Download, Info, Settings, Edit3, FileText, MessageCirclePlus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateAndDownloadOpml } from "@/lib/opml-generator";
import { generateCsvDownload, FeedWithCategory } from "@/lib/csv-generator";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePrivacyStore } from "@/stores/usePrivacyStore";
import { useFeedsStore, Feed } from "@/stores/useFeedsStore";
import { useHealthStore } from "@/stores/useHealthStore";
import { PrivacySettingsSheet } from "@/components/PrivacySettingsSheet";
import { EditFeedsSheet } from "@/components/EditFeedsSheet";
import { SuggestFeedSheet } from "@/components/SuggestFeedSheet";
import { FeedCard, FeedCardSkeleton } from "@/components/feed-card";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PrivacyBanner } from "@/components/PrivacyBanner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { motion, AnimatePresence } from "framer-motion";
import { StickySearch } from "@/components/StickySearch";
import { useShallow } from 'zustand/react/shallow';
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
const SkeletonGrid = React.memo(({ count = 6 }: { count?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
  >
    {Array.from({ length: count }).map((_, i) => (
      <FeedCardSkeleton key={i} />
    ))}
  </motion.div>
));
SkeletonGrid.displayName = 'SkeletonGrid';
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [isPrivacySheetOpen, setPrivacySheetOpen] = useState(false);
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  const [isSuggestSheetOpen, setSuggestSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const storageMode = usePrivacyStore(s => s.storageMode);
  const favoriteUrls = useFavoritesStore(s => s.favoriteUrls);
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite);
  const showFavoritesOnly = useFavoritesStore(s => s.showFavoritesOnly);
  const toggleShowFavoritesOnly = useFavoritesStore(s => s.toggleShowFavoritesOnly);
  const healthChecksEnabled = usePrivacyStore(s => s.healthChecksEnabled);
  const categorizedFeeds = useFeedsStore(useShallow(s => s.categorizedFeeds));
  const isCheckingHealth = useHealthStore(s => s.isChecking);
  const isSearching = searchQuery !== "" && searchQuery !== debouncedSearchQuery;
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, showFavoritesOnly]);
  const isFavorite = useCallback((url: string) => favoriteUrls.includes(url), [favoriteUrls]);
  const flatFeedsWithCategory = useMemo<FeedWithCategory[]>(() =>
    Object.entries(categorizedFeeds).flatMap(([category, feeds]) =>
      feeds.map(feed => ({ ...feed, category }))
    ), [categorizedFeeds]);
  const totalFeedsCount = useMemo(() => flatFeedsWithCategory.length, [flatFeedsWithCategory]);
  const shortcutHandlers = {
    onSearchFocus: () => searchInputRef.current?.focus(),
    onEditOpen: () => setEditSheetOpen(true),
    onToggleFavorites: toggleShowFavoritesOnly,
  };
  useKeyboardShortcuts(shortcutHandlers);
  useEffect(() => {
    useFeedsStore.getState().loadFromStorage();
    useFavoritesStore.getState().loadFromStorage();
    useHealthStore.getState().loadFromStorage();
  }, [storageMode]);
  useEffect(() => {
    if (healthChecksEnabled) {
      const allUrls = flatFeedsWithCategory.map(f => f.url);
      if (allUrls.length > 0) {
        useHealthStore.getState().checkHealth(allUrls);
      }
    }
  }, [healthChecksEnabled, flatFeedsWithCategory]);
  const categoryFilteredFeeds = useMemo(() =>
    selectedCategory === 'All'
      ? flatFeedsWithCategory
      : flatFeedsWithCategory.filter(f => f.category === selectedCategory),
    [selectedCategory, flatFeedsWithCategory]
  );
  const favoriteFeeds = useMemo(() =>
    categoryFilteredFeeds.filter(feed => favoriteUrls.includes(feed.url)),
    [categoryFilteredFeeds, favoriteUrls]
  );
  const { paginatedResults, totalPages, searchResultCount } = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return { paginatedResults: [], totalPages: 0, searchResultCount: 0 };
    }
    const sourceFeeds = showFavoritesOnly ? favoriteFeeds : categoryFilteredFeeds;
    const queryTokens = debouncedSearchQuery.toLowerCase().split(' ').filter(Boolean);
    const scoredFeeds: ScoredFeed[] = [];
    sourceFeeds.forEach(feed => {
      let score = 0;
      const titleLower = feed.title.toLowerCase();
      const urlLower = feed.url.toLowerCase();
      queryTokens.forEach(token => {
        if (titleLower.includes(token)) score += 2;
        if (urlLower.includes(token)) score += 1;
      });
      if (score > 0) {
        scoredFeeds.push({ feed, category: feed.category, score });
      }
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
  }, [debouncedSearchQuery, showFavoritesOnly, favoriteFeeds, categoryFilteredFeeds, currentPage]);
  const categorizedAndFilteredFeeds = useMemo(() => {
    if (debouncedSearchQuery.trim()) return {};
    const source = showFavoritesOnly ? favoriteFeeds : categoryFilteredFeeds;
    if (showFavoritesOnly) {
        return { "Favorites": source };
    }
    // Re-group flat list back into categories
    return source.reduce((acc, feed) => {
        if (!acc[feed.category]) {
            acc[feed.category] = [];
        }
        acc[feed.category].push(feed);
        return acc;
    }, {} as Record<string, FeedWithCategory[]>);
  }, [debouncedSearchQuery, showFavoritesOnly, favoriteFeeds, categoryFilteredFeeds]);
  const renderContent = () => {
    if (isCheckingHealth) {
      return <SkeletonGrid count={9} />;
    }
    if (isSearching) {
      return <SkeletonGrid count={9} />;
    }
    if (debouncedSearchQuery.trim()) {
      if (paginatedResults.length > 0) {
        return (
          <>
            <LazySection category="Search Results" feeds={paginatedResults} searchQuery={debouncedSearchQuery} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
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
          </>
        );
      }
      return (
        <div className="text-center py-16">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{showFavoritesOnly ? "No favorite feeds match your search." : `No feeds found for "${debouncedSearchQuery}"`}</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{showFavoritesOnly && favoriteUrls.length === 0 ? "You haven't favorited any feeds yet." : "Try a different search term."}</p>
        </div>
      );
    }
    return Object.entries(categorizedAndFilteredFeeds).map(([category, feeds]) => (
      feeds.length > 0 && <LazySection key={category} category={category} feeds={feeds} searchQuery={debouncedSearchQuery} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
    ));
  };
  const contentKey = isCheckingHealth ? 'health-check' : isSearching ? 'searching' : debouncedSearchQuery.trim() ? 'search' : 'categories';
  const resultsCount = debouncedSearchQuery.trim() ? searchResultCount : categoryFilteredFeeds.length;
  return (
    <AppLayout>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-4 left-4 z-[100] bg-background px-4 py-2 rounded-lg shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
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
                {totalFeedsCount}+ Categorized RSS/Atom Feeds for the Lehigh Valley Region
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                 <Button onClick={generateAndDownloadOpml} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500" size="lg">
                    <Download className="mr-2 h-5 w-5" /> Download OPML
                  </Button>
                  <Button onClick={() => generateCsvDownload(flatFeedsWithCategory)} size="lg" variant="outline" className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50">
                    <FileText className="mr-2 h-5 w-5" /> Download CSV
                  </Button>
                  <PWAInstallPrompt />
                  <Button onClick={() => setSuggestSheetOpen(true)} variant="outline" size="lg" className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50">
                    <MessageCirclePlus className="mr-2 h-5 w-5" /> Suggest Feed
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => setEditSheetOpen(true)} variant="outline" size="lg" className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50">
                          <Edit3 className="mr-2 h-5 w-5" /> Edit Feeds
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Shortcut: <kbd className="font-sans bg-gray-200 dark:bg-slate-700 rounded px-1.5 py-0.5 text-xs">E</kbd></p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button onClick={() => setPrivacySheetOpen(true)} variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50" aria-label="Privacy settings">
                    <Settings className="h-6 w-6" />
                  </Button>
              </div>
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl shadow-sm flex items-center justify-center gap-2 max-w-2xl mx-auto">
                <Info className="h-5 w-5 flex-shrink-0 text-indigo-800 dark:text-indigo-200" />
                <p className="font-medium text-sm text-indigo-800 dark:text-indigo-200">This is an index only. Use "Copy URL" to subscribe to feeds in your RSS reader.</p>
              </div>
            </header>
            <PrivacyBanner />
            <StickySearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavorites={toggleShowFavoritesOnly}
              favoriteCount={favoriteUrls.length}
              resultsCount={resultsCount}
            />
            {debouncedSearchQuery && !isSearching && (<div className="text-center -mt-4 mb-4" role="status"><Badge variant="secondary">{searchResultCount} result{searchResultCount === 1 ? '' : 's'} found</Badge></div>)}
            <div className="space-y-16 md:space-y-24">
              <AnimatePresence mode="popLayout">
                <motion.div key={contentKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
        <footer className="mt-12 py-8 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm text-sm text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:text-left">
                <h4 className="font-semibold text-foreground mb-2">About</h4>
                <p>Built with ❤️ at Cloudflare. This is a community-driven index of public RSS feeds for the Lehigh Valley region.</p>
              </div>
              <div className="md:text-center">
                 <h4 className="font-semibold text-foreground mb-2">Data Sources</h4>
                 <p>The initial feed list is sourced from the community-maintained <a href="https://github.com/lehighvalley-feeds/lv-intelligence-feed" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">LV Intelligence Feed project</a>. You can export the current list via the OPML/CSV buttons above.</p>
              </div>
              <div className="md:text-right">
                <h4 className="font-semibold text-foreground mb-2">Privacy</h4>
                <p>Data is stored in your browser's {storageMode === 'local' ? 'persistent' : 'session'} storage. No tracking or analytics are used.</p>
              </div>
            </div>
          </div>
        </footer>
        <Toaster richColors position="top-right" />
        <PrivacySettingsSheet open={isPrivacySheetOpen} onOpenChange={setPrivacySheetOpen} />
        <EditFeedsSheet open={isEditSheetOpen} onOpenChange={setEditSheetOpen} />
        <SuggestFeedSheet open={isSuggestSheetOpen} onOpenChange={setSuggestSheetOpen} />
      </div>
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
    </AppLayout>
  );
}
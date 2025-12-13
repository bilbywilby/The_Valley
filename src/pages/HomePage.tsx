import React, { useState, useMemo, useRef } from "react";
import { Download, Search, Info, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { categorizedFeeds } from "@/data/feeds";
import { FeedCard } from "@/components/feed-card";
import { generateAndDownloadOpml } from "@/lib/opml-generator";
import { motion, AnimatePresence } from "framer-motion";
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filteredFeeds = useMemo(() => {
    if (!searchQuery.trim()) {
      return categorizedFeeds;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered: Record<string, any[]> = {};
    for (const category in categorizedFeeds) {
      const matchingFeeds = categorizedFeeds[category].filter(
        (feed) =>
          feed.title.toLowerCase().includes(lowercasedQuery) ||
          feed.url.toLowerCase().includes(lowercasedQuery)
      );
      if (matchingFeeds.length > 0) {
        filtered[category] = matchingFeeds;
      }
    }
    return filtered;
  }, [searchQuery]);
  const totalFeeds = useMemo(() => Object.values(categorizedFeeds).flat().length, []);
  const searchResultCount = useMemo(() => Object.values(filteredFeeds).flat().length, [filteredFeeds]);
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 bg-gradient-mesh">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16">
            <header className="text-center mb-10 animate-fade-in backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-white/20 shadow-glass rounded-3xl p-8 md:p-12">
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                LV Intelligence <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">Feed Index</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
                {totalFeeds}+ Categorized RSS/Atom Feeds for the Lehigh Valley Region
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button
                    onClick={generateAndDownloadOpml}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-glow"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Full OPML
                  </Button>
              </div>
              <div className="mt-6 p-3 bg-white/5 dark:bg-slate-900/30 backdrop-blur-md border border-white/20 shadow-glass rounded-2xl flex items-center justify-center gap-2 max-w-2xl mx-auto">
                <Info className="h-5 w-5 flex-shrink-0 text-indigo-800 dark:text-indigo-200" />
                <p className="font-medium text-sm text-indigo-800 dark:text-indigo-200">
                  This is an index only. Use "Copy URL" to subscribe to feeds in your RSS reader.
                </p>
              </div>
            </header>
            <div className="sticky top-4 z-50 mb-10">
              <div className="relative max-w-2xl mx-auto backdrop-blur-md bg-white/80 dark:bg-slate-800/60 border border-white/30 shadow-glass rounded-3xl overflow-hidden shadow-xl">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={`Search ${totalFeeds}+ feeds... (e.g. "Police", "Allentown")`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 h-12 text-base rounded-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500"
                 />
                 {searchQuery.length > 0 && (
                    <Button
                        onClick={handleClearSearch}
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                 )}
              </div>
              {searchQuery && (
                <div className="text-center mt-2">
                  {searchResultCount > 0 ? (
                     <Badge variant="secondary">{searchResultCount} result{searchResultCount === 1 ? '' : 's'} found</Badge>
                  ) : (
                     <Badge variant="destructive">No results found</Badge>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-16 md:space-y-24">
              <AnimatePresence>
                {Object.keys(filteredFeeds).length > 0 ? (
                  Object.entries(filteredFeeds).map(([category, feeds]) => (
                    <motion.section
                      key={category}
                      id={category.replace(/\s+/g, '-').toLowerCase()}
                      className="backdrop-blur-md bg-white/70 dark:bg-slate-800/40 border border-white/20 shadow-glass p-6 md:p-8 rounded-3xl"
                      layout
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6 }}
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
                          <FeedCard key={feed.url} feed={feed} />
                        ))}
                      </motion.div>
                    </motion.section>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No feeds found for "{searchQuery}"</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try a different search term.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        <footer className="mt-12 py-6 border-t border-white/20 dark:border-slate-800/50 text-center text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-slate-900/20 backdrop-blur">
          Built with ❤️ at Cloudflare
        </footer>
        <Toaster richColors position="top-right" />
      </div>
    </AppLayout>
  );
}
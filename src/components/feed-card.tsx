import React, { useState, useCallback } from "react";
import { Copy, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
<<<<<<< HEAD
=======
import { Skeleton } from "@/components/ui/skeleton";
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Feed } from "@/data/feeds";
import { motion } from "framer-motion";
<<<<<<< HEAD
=======
import { HealthStatusIcon } from "./HealthStatusIcon";
import { Badge } from "@/components/ui/badge";
import { escapeHtml } from "@/lib/utils";
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
interface FeedCardProps {
  feed: Feed;
  searchQuery: string;
  isFavorite: boolean;
  onToggleFavorite: (url: string) => void;
<<<<<<< HEAD
}
const HighlightedText = React.memo(({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
=======
  category?: string;
}
const HighlightedText = React.memo(({ text, highlight }: { text: string; highlight: string }) => {
  const safeText = escapeHtml(text);
  const safeHighlight = escapeHtml(highlight);
  if (!safeHighlight || !safeHighlight.trim()) {
    return <span dangerouslySetInnerHTML={{ __html: safeText.replace(/&amp;#39;/g, "'") }} />;
  }
  const regex = new RegExp(`(${safeHighlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = safeText.split(regex);
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-400/80 dark:text-slate-900 font-bold rounded px-1">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
});
<<<<<<< HEAD
export function FeedCard({ feed, searchQuery, isFavorite, onToggleFavorite }: FeedCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(feed.url).then(() => {
      setCopied(true);
      toast.success(`Copied URL for "${feed.title}"`);
=======
HighlightedText.displayName = 'HighlightedText';
export function FeedCard({ feed, searchQuery, isFavorite, onToggleFavorite, category }: FeedCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(feed.url).then(() => {
      setCopied(true);
      toast.success(`Copied URL for "${feed.title}"`, {
        description: (
          <div className="text-xs mt-1">
            <p>Paste into your RSS reader. Quick links:</p>
            <a href={`https://feedly.com/i/subscription/feed/${encodeURIComponent(feed.url)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Feedly</a>
            {' | '}
            <a href={`https://www.inoreader.com/feed/${encodeURIComponent(feed.url)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Inoreader</a>
          </div>
        ),
        duration: 5000,
      });
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy URL: ", err);
      toast.error("Failed to copy URL to clipboard.");
    });
  }, [feed.url, feed.title]);
<<<<<<< HEAD
=======
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(feed.url);
  };
  const handleCardClick = () => {
    window.open(feed.url, '_blank', 'noopener,noreferrer');
  };
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };
  const safeTitle = feed.title;
  const safeUrl = feed.url;
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
<<<<<<< HEAD
      <Card className="group flex flex-col h-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-4 flex flex-col flex-grow">
          <p className="text-base font-semibold text-foreground mb-2 flex-grow">
            <HighlightedText text={feed.title} highlight={searchQuery} />
          </p>
          <p className="text-xs text-muted-foreground truncate mb-4" aria-hidden="true">{feed.url}</p>
          <div className="mt-auto flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onToggleFavorite(feed.url)}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-yellow-500 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500"
                    aria-label={`Toggle ${isFavorite ? 'remove' : 'add'} "${feed.title}" to favorites`}
                  >
                    <Star className={`h-5 w-5 transition-all duration-200 ${isFavorite ? 'fill-yellow-400 text-yellow-500' : 'fill-transparent'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={handleCopy}
              size="sm"
              className={`w-full group transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                copied
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
              }`}
              aria-label={`Copy URL for ${feed.title}`}
            >
              {copied ? (
                <>
                  <Check className="-ml-1 mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="-ml-1 mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
=======
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              onClick={handleCardClick}
              onKeyDown={handleCardKeyDown}
              role="button"
              tabIndex={0}
              aria-label={`Open ${safeTitle} in new tab`}
              className="group flex flex-col h-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-indigo-500/50"
            >
              <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex items-start gap-2 mb-1">
                  <HealthStatusIcon url={safeUrl} />
                  <p className="text-base font-semibold text-foreground flex-grow">
                    <HighlightedText text={safeTitle} highlight={searchQuery} />
                  </p>
                </div>
                {category && <Badge variant="secondary" className="text-xs mb-2 self-start ml-6">{escapeHtml(category)}</Badge>}
                <p className="text-xs text-muted-foreground truncate mb-4" aria-hidden="true">{escapeHtml(safeUrl)}</p>
                <div className="mt-auto flex items-center gap-2">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleToggleFavorite}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-yellow-500 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500"
                          aria-label={`Toggle ${isFavorite ? 'remove' : 'add'} "${safeTitle}" to favorites`}
                          aria-pressed={isFavorite}
                        >
                          <Star className={`h-5 w-5 transition-all duration-200 ${isFavorite ? 'fill-yellow-400 text-yellow-500' : 'fill-transparent'}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className={`w-full group transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                      copied
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
                    }`}
                    aria-label={`Copy URL for ${safeTitle}`}
                  >
                    {copied ? (
                      <>
                        <Check className="-ml-1 mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="-ml-1 mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        Copy URL
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click card to open feed in a new tab</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}
export function FeedCardSkeleton() {
  return (
    <Card className="h-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 shadow-sm">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mb-4" />
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
}
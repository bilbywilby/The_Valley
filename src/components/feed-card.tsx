import React, { useState, useCallback } from "react";
import { Copy, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Feed } from "@/data/feeds";
import { motion } from "framer-motion";
import { HealthStatusIcon } from "./HealthStatusIcon";
interface FeedCardProps {
  feed: Feed;
  searchQuery: string;
  isFavorite: boolean;
  onToggleFavorite: (url: string) => void;
}
const HighlightedText = React.memo(({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
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
HighlightedText.displayName = 'HighlightedText';
export function FeedCard({ feed, searchQuery, isFavorite, onToggleFavorite }: FeedCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(feed.url).then(() => {
      setCopied(true);
      toast.success(`Copied URL for "${feed.title}"`);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy URL: ", err);
      toast.error("Failed to copy URL to clipboard.");
    });
  }, [feed.url, feed.title]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group flex flex-col h-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-start gap-2 mb-2">
            <HealthStatusIcon url={feed.url} />
            <p className="text-base font-semibold text-foreground flex-grow">
              <HighlightedText text={feed.title} highlight={searchQuery} />
            </p>
          </div>
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
}
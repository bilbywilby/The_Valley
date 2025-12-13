import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Feed } from "@/data/feeds";
import { motion } from "framer-motion";
interface FeedCardProps {
  feed: Feed;
}
export function FeedCard({ feed }: FeedCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(feed.url).then(() => {
      setCopied(true);
      toast.success(`Copied URL for "${feed.title}"`);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy URL: ", err);
      toast.error("Failed to copy URL to clipboard.");
    });
  };
  return (
    <motion.div
      layoutId={`feed-${feed.url}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group flex flex-col h-full backdrop-blur-md bg-white/60 dark:bg-slate-800/50 border border-white/20 shadow-glass hover:shadow-glow-lg hover:-translate-y-2 transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-4 flex flex-col flex-grow">
          <p className="text-lg font-display font-semibold text-foreground mb-1 flex-grow">{feed.title}</p>
          <p className="text-xs text-muted-foreground truncate mb-4">{feed.url}</p>
          <Button
            onClick={handleCopy}
            size="sm"
            className={`w-full mt-auto group transition-all duration-200 hover:scale-105 active:scale-95 group-hover:rotate-1 ${
              copied
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-700 hover:via-purple-700 hover:to-emerald-600 text-white shadow-glow hover:shadow-glow-lg"
            }`}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
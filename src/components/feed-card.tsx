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
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="group flex flex-col h-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 shadow-sm hover:shadow-md hover:-translate-y-1 hover:scale-105 transition-all duration-300">
        <CardContent className="p-4 flex flex-col flex-grow">
          <p className="text-base font-semibold text-foreground mb-2 flex-grow">{feed.title}</p>
          <p className="text-xs text-muted-foreground truncate mb-4">{feed.url}</p>
          <Button
            onClick={handleCopy}
            size="sm"
            className={`w-full mt-auto group transition-all duration-200 hover:scale-105 active:scale-95 ${
              copied
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
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
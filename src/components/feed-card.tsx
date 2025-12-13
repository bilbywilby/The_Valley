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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col h-full bg-card/50 hover:bg-card/90 transition-colors duration-200 shadow-sm hover:shadow-md">
        <CardContent className="p-4 flex flex-col flex-grow">
          <p className="font-semibold text-foreground mb-1 flex-grow">{feed.title}</p>
          <p className="text-xs text-muted-foreground truncate mb-4">{feed.url}</p>
          <Button
            onClick={handleCopy}
            variant={copied ? "secondary" : "default"}
            size="sm"
            className="w-full mt-auto transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {copied ? (
              <>
                <Check className="-ml-1 mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="-ml-1 mr-2 h-4 w-4" />
                Copy URL
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeedsStore } from '@/stores/useFeedsStore';
import { toast } from 'sonner';
import { MessageCirclePlus, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
interface SuggestFeedSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GITHUB_ISSUES_URL = 'https://github.com/lehighvalley-feeds/lv-intelligence-feed/issues/new';
export function SuggestFeedSheet({ open, onOpenChange }: SuggestFeedSheetProps) {
  const categories = Object.keys(useFeedsStore.getState().categorizedFeeds);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const handleSubmit = () => {
    if (!title.trim() || !url.trim() || !category) {
      toast.error('Please fill in Title, URL, and Category.');
      return;
    }
    const issueBody = `
**Title:** ${title}
**URL:** ${url}
**Category:** ${category}
**Description:** ${description || 'N/A'}
    `;
    navigator.clipboard.writeText(issueBody.trim()).then(() => {
      setCopied(true);
      toast.success('Suggestion copied to clipboard!', {
        description: (
          <div>
            Please paste this into a new issue on GitHub:
            <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
              Create Issue
            </a>
          </div>
        ),
        duration: 8000,
      });
      setTimeout(() => {
        setCopied(false);
        onOpenChange(false);
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy: ", err);
      toast.error("Could not copy to clipboard.");
    });
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <MessageCirclePlus className="h-6 w-6 text-indigo-500" />
            Suggest a New Feed
          </SheetTitle>
          <SheetDescription>
            Help improve this index by suggesting a new feed. This will generate text for a new GitHub issue.
          </SheetDescription>
        </SheetHeader>
        <motion.div
          className="flex-1 py-4 space-y-4 overflow-y-auto pr-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div>
            <Label htmlFor="suggest-title">Feed Title</Label>
            <Input id="suggest-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., My Local News" />
          </div>
          <div>
            <Label htmlFor="suggest-url">Feed URL</Label>
            <Input id="suggest-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/feed.xml" />
          </div>
          <div>
            <Label htmlFor="suggest-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="suggest-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="suggest-description">Description (Optional)</Label>
            <Textarea id="suggest-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why should this feed be added?" />
          </div>
        </motion.div>
        <SheetFooter>
          <Button onClick={handleSubmit} className="w-full" disabled={copied}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copy Suggestion & Close
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
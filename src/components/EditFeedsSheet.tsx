import React, { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeedsStore, Feed } from '@/stores/useFeedsStore';
import { toast } from 'sonner';
import { Edit3, Plus, Trash2, Upload, Download, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
function SortableFeedItem({ feed, category, onDelete }: { feed: Feed; category: string; onDelete: (url: string) => void; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: feed.url });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between bg-secondary p-2 rounded-md"
    >
      <div className="flex items-center gap-2 flex-1 truncate">
        <button {...attributes} {...listeners} className="cursor-grab touch-none p-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-medium truncate flex-1" title={feed.title}>{feed.title}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(feed.url)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </motion.div>
  );
}
export function EditFeedsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  const {
    categorizedFeeds, addCategory, deleteCategory, addFeed, deleteFeed, exportData, importData, reorderFeeds
  } = useFeedsStore();
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categorizedFeeds)[0] || '');
  const [newFeedTitle, setNewFeedTitle] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categorizedFeeds[selectedCategory].findIndex(f => f.url === active.id);
      const newIndex = categorizedFeeds[selectedCategory].findIndex(f => f.url === over.id);
      reorderFeeds(selectedCategory, oldIndex, newIndex);
    }
  };
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      toast.success(`Category "${newCategory.trim()}" added.`);
      setNewCategory('');
    }
  };
  const handleAddFeed = () => {
    if (newFeedTitle.trim() && newFeedUrl.trim() && selectedCategory) {
      addFeed(selectedCategory, { title: newFeedTitle.trim(), url: newFeedUrl.trim() });
      toast.success(`Feed "${newFeedTitle.trim()}" added to ${selectedCategory}.`);
      setNewFeedTitle('');
      setNewFeedUrl('');
    }
  };
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importData(content)) {
          toast.success('Feeds imported successfully!');
        } else {
          toast.error('Failed to import feeds. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };
  const handleExport = () => {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lv-feeds-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Feeds exported successfully!');
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Edit3 className="h-6 w-6 text-indigo-500" />
            Edit Feeds & Categories
          </SheetTitle>
          <SheetDescription>
            Add, remove, or reorder your feed sources. Changes are saved automatically based on your privacy settings.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow py-4 space-y-6 overflow-y-auto pr-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Manage Categories</h3>
            <div className="flex gap-2">
              <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" />
              <Button onClick={handleAddCategory}><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {Object.keys(categorizedFeeds).map((cat) => (
                <div key={cat} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                  <span className="text-sm font-medium">{cat}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCategory(cat)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Manage Feeds</h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>{Object.keys(categorizedFeeds).map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={newFeedTitle} onChange={(e) => setNewFeedTitle(e.target.value)} placeholder="New feed title" />
            <Input value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} placeholder="New feed URL" />
            <Button onClick={handleAddFeed} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Feed</Button>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categorizedFeeds[selectedCategory]?.map(f => f.url) || []} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {categorizedFeeds[selectedCategory]?.map((feed) => (
                      <SortableFeedItem key={feed.url} feed={feed} category={selectedCategory} onDelete={(url) => deleteFeed(selectedCategory, url)} />
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            </div>
          </div>
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Backup & Restore</h3>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Export JSON</Button>
              <Button asChild variant="outline" className="w-full">
                <Label><Upload className="h-4 w-4 mr-2" /> Import JSON<Input type="file" accept=".json" className="hidden" onChange={handleImport} /></Label>
              </Button>
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild><Button type="submit" className="w-full">Done</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
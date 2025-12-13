import React from "react";
import { Rss, Newspaper, Building, Shield, Briefcase, GraduationCap, School, Users, Clapperboard, Utensils, Leaf, Mountain, Trophy, Bus, HeartPulse, Wrench, Star } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { useFeedsStore } from "@/stores/useFeedsStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useHealthStore } from "@/stores/useHealthStore";
import { Badge } from "@/components/ui/badge";
const categoryIcons: { [key: string]: React.ElementType } = {
  "News - Regional": Newspaper,
  "News - Local": Newspaper,
  "Gov - Municipal": Building,
  "Gov - County": Building,
  "Safety - Police & Courts": Shield,
  "LV Business": Briefcase,
  "Education - Higher Ed": GraduationCap,
  "Education - K12": School,
  "Community & Civic": Users,
  "Media / Culture": Clapperboard,
  "Lifestyle - Arts & Events": Clapperboard,
  "Lifestyle - Food & Drink": Utensils,
  "Lifestyle - Environment": Leaf,
  "Lifestyle - Outdoors": Mountain,
  "Sports": Trophy,
  "Transit & Weather": Bus,
  "Health": HeartPulse,
  "Utilities / Infrastructure": Wrench,
};
export function AppSidebar(): JSX.Element {
  const categorizedFeeds = useFeedsStore(s => s.categorizedFeeds);
  const categories = Object.keys(categorizedFeeds);
  const favoritesCount = useFavoritesStore(state => state.favoriteUrls.length);
  const toggleShowFavoritesOnly = useFavoritesStore(state => state.toggleShowFavoritesOnly);
  const statuses = useHealthStore(s => s.statuses);
  const getCategoryHealthPercent = (category: string) => {
    const feeds = categorizedFeeds[category];
    if (!feeds || feeds.length === 0) return null;
    const healthyCount = feeds.filter(f => statuses[f.url]?.status === 'ok').length;
    return Math.round((healthyCount / feeds.length) * 100);
  };
  const scrollToCategory = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    const elementId = category.replace(/\s+/g, '-').toLowerCase();
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <Sidebar className="!bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm !border-r border-gray-200/50 dark:border-slate-700/50 shadow-md">
      <SidebarHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md p-3">
        <div className="flex items-center gap-2">
          <Rss className="h-6 w-6 text-white" />
          <span className="text-sm font-display text-white">Feed Categories</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="pr-2">
        <SidebarMenu>
          <SidebarMenuItem key="favorites">
            <SidebarMenuButton asChild className="group hover:bg-accent/50 hover:shadow-sm hover:scale-105 transition-all duration-150">
              <a href="#favorites" onClick={(e) => { e.preventDefault(); toggleShowFavoritesOnly(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <Star className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Favorites</span>
              </a>
            </SidebarMenuButton>
            <SidebarMenuBadge className="bg-yellow-400/80 text-yellow-900">{favoritesCount}</SidebarMenuBadge>
          </SidebarMenuItem>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Rss;
            const healthPercent = getCategoryHealthPercent(category);
            return (
              <SidebarMenuItem key={category}>
                <SidebarMenuButton asChild className="group hover:bg-accent/50 hover:shadow-sm hover:scale-105 transition-all duration-150">
                  <a href={`#${category.replace(/\s+/g, '-').toLowerCase()}`} onClick={(e) => scrollToCategory(e, category)}>
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">{category}</span>
                  </a>
                </SidebarMenuButton>
                {healthPercent !== null && (
                  <Badge variant={healthPercent > 80 ? "default" : "destructive"} className="text-xs">{healthPercent}%</Badge>
                )}
                <SidebarMenuBadge>{categorizedFeeds[category].length}</SidebarMenuBadge>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
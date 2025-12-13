import React from "react";
import { Rss, Newspaper, Building, Shield, Briefcase, GraduationCap, School, Users, Clapperboard, Utensils, Leaf, Mountain, Trophy, Bus, HeartPulse, Wrench } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { categorizedFeeds } from "@/data/feeds";
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
  const categories = Object.keys(categorizedFeeds);
  const scrollToCategory = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    const element = document.getElementById(category.replace(/\s+/g, '-').toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Rss className="h-6 w-6 text-indigo-500" />
          <span className="text-sm font-medium">Feed Categories</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="pr-2">
        <SidebarMenu>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Rss;
            return (
              <SidebarMenuItem key={category}>
                <SidebarMenuButton asChild className="group hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] transition-all duration-150">
                  <a href={`#${category.replace(/\s+/g, '-').toLowerCase()}`} onClick={(e) => scrollToCategory(e, category)}>
                    <Icon className="w-4 h-4" />
                    <span>{category}</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge className="transition-transform group-hover:scale-105">{categorizedFeeds[category].length}</SidebarMenuBadge>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
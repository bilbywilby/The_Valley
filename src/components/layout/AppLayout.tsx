import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
/* Simple wrapper for SidebarInset – swipe handling removed */
function SidebarInsetWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <SidebarInset className={cn(className)}>{children}</SidebarInset>;
}
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInsetWrapper className={className}>
        <div className="absolute left-2 top-2 z-50">
          <SidebarTrigger className="md:hidden h-10 w-10 p-0 rounded-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200" />
        </div>
        {container ? (
          <div className={cn("relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>{children}</div>
        ) : (
          <div className="relative z-20">
            {children}
          </div>
        )}
        </SidebarInsetWrapper>
    </SidebarProvider>
  );
}
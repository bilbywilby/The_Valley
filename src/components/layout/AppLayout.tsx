import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
function SwipableSidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, openSidebar, closeSidebar } = useSidebar();
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (!isOpen) openSidebar();
    },
    onSwipedLeft: () => {
      if (isOpen) closeSidebar();
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    swipeDuration: 500,
    delta: 50,
  });
  return (
    <SidebarInset ref={handlers.ref} className={cn(className, "[&>*]:touch-pan-y")}>
      {children}
    </SidebarInset>
  );
}
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SwipableSidebarInset className={className}>
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
      </SwipableSidebarInset>
    </SidebarProvider>
  );
}
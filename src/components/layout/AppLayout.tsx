import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
<<<<<<< HEAD
=======
import { cn } from "@/lib/utils";
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
<<<<<<< HEAD
=======
/* Simple wrapper for SidebarInset – swipe handling removed */
function SidebarInsetWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <SidebarInset className={cn(className)}>{children}</SidebarInset>;
}
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
<<<<<<< HEAD
      <SidebarInset className={className}>
=======
      <SidebarInsetWrapper className={className}>
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
        <div className="absolute left-2 top-2 z-50">
          <SidebarTrigger className="md:hidden h-10 w-10 p-0 rounded-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200" />
        </div>
        {container ? (
<<<<<<< HEAD
          <div className={"relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>{children}</div>
=======
          <div className={cn("relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>{children}</div>
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
        ) : (
          <div className="relative z-20">
            {children}
          </div>
        )}
        </SidebarInsetWrapper>
    </SidebarProvider>
  );
}
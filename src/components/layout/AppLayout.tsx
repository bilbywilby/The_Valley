/*
Wraps children in a sidebar layout. Don't use this if you don't need a sidebar
*/
import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={className}>
        <div className="absolute left-2 top-2 z-50">
          <SidebarTrigger className="md:hidden h-10 w-10 p-0 rounded-full backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200" />
        </div>
        {container ? (
          <div className={"relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>{children}</div>
        ) : (
          <div className="relative z-20">
            {children}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
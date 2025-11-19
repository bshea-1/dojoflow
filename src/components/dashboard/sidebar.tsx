"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/ui-store";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Calendar, 
  Users, 
  Settings, 
  Menu,
  LogOut,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

interface SidebarProps {
  franchiseSlug: string;
}

export function Sidebar({ franchiseSlug }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const links = [
    { href: `/dashboard/${franchiseSlug}`, label: "Overview", icon: LayoutDashboard },
    { href: `/dashboard/${franchiseSlug}/pipeline`, label: "Pipeline", icon: KanbanSquare },
    { href: `/dashboard/${franchiseSlug}/tours`, label: "Tours", icon: Calendar },
    { href: `/dashboard/${franchiseSlug}/students`, label: "Students", icon: Users },
    { href: `/dashboard/${franchiseSlug}/members`, label: "Members (Mock)", icon: UserCheck },
    { href: `/dashboard/${franchiseSlug}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out flex flex-col",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <span className="text-lg font-bold">DojoFlow</span>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
             <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

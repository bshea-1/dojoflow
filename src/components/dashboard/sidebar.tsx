"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/ui-store";
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Users,
  Menu,
  LogOut,
  UserCheck,
  CheckSquare,
  MapPin,
  Zap,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

interface SidebarProps {
  franchiseSlug: string;
  userRole?: string;
  assignedFranchises?: { name: string; slug: string }[];
  taskCount?: number;
}

export function Sidebar({ franchiseSlug, userRole, assignedFranchises = [], taskCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [roleView, setRoleView] = useState<string>("");

  // Load role view from localStorage on mount
  useEffect(() => {
    const savedRoleView = localStorage.getItem("roleView");
    setRoleView(savedRoleView || userRole || "sensei");
  }, [userRole]);

  // Save role view to localStorage when it changes
  const handleRoleViewChange = (newRoleView: string) => {
    setRoleView(newRoleView);
    localStorage.setItem("roleView", newRoleView);
  };

  const links = [
    { href: `/dashboard/${franchiseSlug}`, label: "Overview", icon: LayoutDashboard },
    { href: `/dashboard/${franchiseSlug}/pipeline`, label: "Pipeline", icon: KanbanSquare },
    { href: `/dashboard/${franchiseSlug}/actions`, label: "Actions", icon: CheckSquare },
    { href: `/dashboard/${franchiseSlug}/tours`, label: "Tours", icon: Calendar },
    { href: `/dashboard/${franchiseSlug}/members`, label: "Families", icon: UserCheck },
    { href: `/dashboard/${franchiseSlug}/automations`, label: "Automations", icon: Zap },
  ];

  // Find current franchise name
  const currentFranchiseName = assignedFranchises.find(f => f.slug === franchiseSlug)?.name || "Select Location";

  // Get available role views based on actual user role
  const getAvailableRoleViews = () => {
    if (userRole === "franchisee") {
      return [
        { value: "franchisee", label: "Franchise Owner" },
        { value: "center_director", label: "Center Director" },
        { value: "sensei", label: "Sensei" },
      ];
    } else if (userRole === "center_director") {
      return [
        { value: "center_director", label: "Center Director" },
        { value: "sensei", label: "Sensei" },
      ];
    }
    return [{ value: "sensei", label: "Sensei" }];
  };

  const availableRoleViews = getAvailableRoleViews();
  const currentRoleViewLabel = availableRoleViews.find(r => r.value === roleView)?.label || "Sensei";

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
                <span className="flex-1">{link.label}</span>
                {link.label === "Actions" && taskCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-[10px] font-bold text-white">
                    {taskCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          {/* Role View Switcher */}
          {availableRoleViews.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between gap-3 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    <span>{currentRoleViewLabel}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Switch View</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableRoleViews.map((role) => (
                  <DropdownMenuItem
                    key={role.value}
                    onClick={() => handleRoleViewChange(role.value)}
                    className={cn(role.value === roleView && "bg-accent")}
                  >
                    {role.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Single Role Display (no switching) */}
          {availableRoleViews.length === 1 && (
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{currentRoleViewLabel}</span>
            </div>
          )}

          {/* Location Switcher */}
          {userRole === "franchisee" && assignedFranchises.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{currentFranchiseName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Switch Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {assignedFranchises.map((franchise) => (
                  <DropdownMenuItem
                    key={franchise.slug}
                    onClick={() => router.push(`/dashboard/${franchise.slug}`)}
                    className={cn(franchise.slug === franchiseSlug && "bg-accent")}
                  >
                    {franchise.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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

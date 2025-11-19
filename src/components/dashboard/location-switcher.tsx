"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getUserFranchises } from "@/app/actions/franchises";

interface Franchise {
  id: string;
  name: string;
  slug: string;
}

interface LocationSwitcherProps {
  currentFranchiseSlug: string;
}

export function LocationSwitcher({ currentFranchiseSlug }: LocationSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFranchises() {
      try {
        // Use the server action we just created
        // Note: We need to import the type properly or cast it if the generated types are complex
        const data = await getUserFranchises();
        // The server action returns { id, name, slug }[] or similar structure from Supabase
        // We cast it to our simple interface for now
        setFranchises(data as unknown as Franchise[]);
      } catch (error) {
        console.error("Failed to fetch franchises", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFranchises();
  }, []);

  const currentFranchise = franchises.find((f) => f.slug === currentFranchiseSlug);

  const handleSelect = (slug: string) => {
    // Replace the current slug in the URL with the new one
    // Assuming URL structure is /dashboard/[slug]/...
    const newPath = pathname.replace(`/dashboard/${currentFranchiseSlug}`, `/dashboard/${slug}`);
    router.push(newPath);
  };

  if (loading) {
    return <div className="h-10 w-full bg-slate-100 animate-pulse rounded-md" />;
  }

  // If only 1 location, maybe just show the name statically or disabled button?
  // Requirement says "Select Location button... above log out". Even if 1, it's good for consistency.
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          <span className="truncate">{currentFranchise?.name || "Select Location"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0" align="start">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Switch Location
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {franchises.map((franchise) => (
          <DropdownMenuItem
            key={franchise.id}
            onSelect={() => handleSelect(franchise.slug)}
            className="gap-2 p-2 cursor-pointer"
          >
            <Check
              className={`h-4 w-4 ${
                franchise.slug === currentFranchiseSlug ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="truncate">{franchise.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


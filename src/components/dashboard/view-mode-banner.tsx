"use client";

import { useEffect, useState } from "react";
import { Info, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ViewModeBannerProps {
    userRole?: string;
}

const roleLabels: Record<string, string> = {
    franchisee: "Franchise Owner",
    center_director: "Center Director",
    sensei: "Sensei",
};

export function ViewModeBanner({ userRole }: ViewModeBannerProps) {
    const [roleView, setRoleView] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedRoleView = localStorage.getItem("roleView");
        setRoleView(savedRoleView || userRole || "");

        // Listen for changes to roleView in localStorage
        const handleStorageChange = () => {
            const newRoleView = localStorage.getItem("roleView");
            setRoleView(newRoleView || userRole || "");
        };

        window.addEventListener("storage", handleStorageChange);
        // Also listen for custom event for same-tab updates
        window.addEventListener("roleViewChange", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("roleViewChange", handleStorageChange);
        };
    }, [userRole]);

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return null;

    // Only show banner if viewing as a different role
    if (!roleView || !userRole || roleView === userRole) return null;

    const viewingAsLabel = roleLabels[roleView] || roleView;
    const isSenseiView = roleView === "sensei";

    return (
        <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 shadow-sm">
            <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                <span className="font-semibold">View Mode: Viewing as {viewingAsLabel}</span>
                {isSenseiView && (
                    <span className="ml-2">— Read-only access. Tour booking and editing are disabled.</span>
                )}
                {!isSenseiView && (
                    <span className="ml-2">— Some features may be restricted in this view.</span>
                )}
            </AlertDescription>
        </Alert>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export function ThemeSettings() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const handleSave = () => {
        toast.success("Theme updated successfully");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-base font-semibold mb-3 block">Theme</Label>
                    <RadioGroup value={theme} onValueChange={setTheme}>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light" className="flex-1 cursor-pointer">
                                <div className="font-medium">Light Mode</div>
                                <div className="text-sm text-muted-foreground">Clean and bright interface</div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark" className="flex-1 cursor-pointer">
                                <div className="font-medium">Dark Mode</div>
                                <div className="text-sm text-muted-foreground">Easy on the eyes</div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} size="lg">Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
}

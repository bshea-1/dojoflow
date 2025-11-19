import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "./actions";

export default async function SettingsPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const { data: franchise } = await supabase
    .from("franchises")
    .select("settings")
    .eq("slug", params.slug)
    .single();

  const settings = (franchise?.settings as any) || {};
  const hours = settings.operating_hours || {};
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Default hours logic
  const getDefaultHours = (day: string) => {
    if (day === "Sat") return { open: "10:00", close: "15:00" };
    if (day === "Sun") return null; // Closed
    return { open: "15:00", close: "19:00" }; // Mon-Fri
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Franchise Settings</h1>

      <form action={updateSettings.bind(null, params.slug)}>
        <div className="grid gap-6">
          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set your center's open and close times for tour booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map(day => {
                const savedSettings = hours[day];
                const hasSavedSettings = Object.keys(hours).length > 0;
                const fallback = getDefaultHours(day);

                const effectiveSettings = hasSavedSettings
                  ? day in hours
                    ? savedSettings
                    : fallback
                  : fallback;

                const isOpen = effectiveSettings !== null;
                const defaultOpenValue =
                  effectiveSettings?.open ?? (isOpen ? fallback?.open ?? "" : "");
                const defaultCloseValue =
                  effectiveSettings?.close ?? (isOpen ? fallback?.close ?? "" : "");

                return (
                  <div key={day} className="flex items-center gap-4 p-2 border rounded-md">
                    <div className="w-12 font-bold">{day}</div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day}_closed`} className="text-xs text-muted-foreground">Closed?</Label>
                      <input 
                        type="checkbox" 
                        id={`${day}_closed`} 
                        name={`${day}_closed`} 
                        defaultChecked={!isOpen}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Input 
                        type="time" 
                        name={`${day}_open`} 
                        defaultValue={defaultOpenValue || undefined} 
                        className="w-32"
                        disabled={!isOpen}
                      />
                      <span>to</span>
                      <Input 
                        type="time" 
                        name={`${day}_close`} 
                        defaultValue={defaultCloseValue || undefined} 
                        className="w-32"
                        disabled={!isOpen}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

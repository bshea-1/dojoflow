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

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Franchise Settings</h1>

      <form action={updateSettings.bind(null, params.slug)}>
        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Manage your franchise contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="twilio_phone">Twilio Phone Number</Label>
                <Input 
                  id="twilio_phone" 
                  name="twilio_phone" 
                  defaultValue={settings.twilio_phone || ""} 
                  placeholder="+1234567890" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set your center's open and close times for tour booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map(day => {
                const daySettings = hours[day];
                const isOpen = !!daySettings;
                
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
                        defaultValue={daySettings?.open || "10:00"} 
                        className="w-32"
                      />
                      <span>to</span>
                      <Input 
                        type="time" 
                        name={`${day}_close`} 
                        defaultValue={daySettings?.close || "19:00"} 
                        className="w-32"
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

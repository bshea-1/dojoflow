import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateSettings } from "./actions";

export default async function SettingsPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("settings")
    .eq("slug", params.slug)
    .single();

  const settings = (franchise?.settings as any) || {};
  const currentTheme = settings.theme || "light";

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Franchise Settings</h1>

      <form action={updateSettings.bind(null, params.slug)}>
        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Theme</Label>
                <RadioGroup name="theme" defaultValue={currentTheme}>
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

import { ThemeSettings } from "@/components/settings/theme-settings";

export default async function SettingsPage({ params }: { params: { slug: string } }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Franchise Settings</h1>
      <ThemeSettings />
    </div>
  );
}

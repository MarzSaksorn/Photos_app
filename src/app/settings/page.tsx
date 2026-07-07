'use client';

import { R2ConfigForm } from '@/components/r2-config-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="mb-8 text-xl font-semibold">Settings</h1>
      <div className="mx-auto max-w-md space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Appearance</h2>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <ThemeToggle className="px-3 py-2" />
            </div>
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Cloud Storage</h2>
          <R2ConfigForm />
        </section>
      </div>
    </div>
  );
}

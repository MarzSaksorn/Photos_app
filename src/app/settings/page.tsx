'use client';

import { R2ConfigForm } from '@/components/r2-config-form';

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="mb-6 text-xl font-semibold">Settings</h1>
      <R2ConfigForm />
    </div>
  );
}

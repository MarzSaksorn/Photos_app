'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function R2ConfigForm() {
  const [endpoint, setEndpoint] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const testConnection = async () => {
    setTesting(true);
    setTestResult('idle');
    try {
      const res = await fetch('/api/upload/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, accessKeyId, secretAccessKey, bucketName }),
      });
      setTestResult(res.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaveError('You must be signed in to save settings.');
      setSaving(false);
      return;
    }

    const config = {
      endpoint: endpoint.replace(/\/$/, ''),
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl: `${endpoint.replace(/\/$/, '')}/${bucketName}`,
    };

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      r2_config: config,
    });

    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      router.push('/photos');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <div>
        <label className="text-sm font-medium">R2 Endpoint URL</label>
        <input
          type="url"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://accountid.r2.cloudflarestorage.com"
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Access Key ID</label>
        <input
          type="text"
          value={accessKeyId}
          onChange={(e) => setAccessKeyId(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Secret Access Key</label>
        <input
          type="password"
          value={secretAccessKey}
          onChange={(e) => setSecretAccessKey(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Bucket Name</label>
        <input
          type="text"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
        />
      </div>
      <button
        type="button"
        onClick={testConnection}
        disabled={testing}
        className="w-full rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        {testing ? 'Testing...' : 'Test Connection'}
      </button>
      {testResult === 'success' && <p className="text-sm text-green-600">Connection OK</p>}
      {testResult === 'error' && <p className="text-sm text-red-600">Connection failed</p>}
      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save & Start'}
      </button>
    </form>
  );
}

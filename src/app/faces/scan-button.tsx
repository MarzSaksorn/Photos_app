'use client';

import { useFaceScan } from '@/hooks/use-face-scan';
import { FaceScanProgress } from '@/components/face-scan-progress';

export function FaceScanButton() {
  const { progress, startScan, pauseScan, resumeScan, resetScan } = useFaceScan();

  const handleStartScan = async () => {
    const res = await fetch('/api/photos?limit=9999');
    const { photos } = await res.json();
    const urls = photos.map((p: any) => `/api/photos/${p.id}/thumbnail`);
    await startScan(urls);
  };

  return (
    <>
      <button
        onClick={handleStartScan}
        disabled={progress.status === 'scanning' || progress.status === 'clustering'}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-50"
      >
        Scan Faces
      </button>
      <FaceScanProgress
        progress={progress}
        onPause={pauseScan}
        onResume={resumeScan}
        onDismiss={resetScan}
      />
    </>
  );
}

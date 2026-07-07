'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { saveProgress, saveFaceResult, getProgress, getAllFaceResults, clearResults } from '@/lib/face-db';
import type { ScanProgress } from '@/types';

export function useFaceScan() {
  const [progress, setProgress] = useState<ScanProgress>({
    total: 0,
    completed: 0,
    facesFound: 0,
    status: 'idle',
    currentPhoto: null,
  });
  const workerRef = useRef<Worker | null>(null);
  const facesFoundRef = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    getProgress().then((saved) => {
      if (saved && saved.status === 'scanning') {
        setProgress({
          total: saved.total,
          completed: saved.completed,
          facesFound: saved.facesFound,
          status: 'idle',
          currentPhoto: null,
        });
      }
    });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const startScan = useCallback(async (photoUrls: string[]) => {
    await clearResults();
    facesFoundRef.current = 0;

    setProgress({
      total: photoUrls.length,
      completed: 0,
      facesFound: 0,
      status: 'scanning',
      currentPhoto: null,
    });

    if (workerRef.current) {
      workerRef.current.terminate();
    }
    workerRef.current = new Worker(new URL('../workers/face-worker', import.meta.url));
    const worker = workerRef.current;

    worker.onmessage = async (e) => {
      const msg = e.data;

      switch (msg.type) {
        case 'models-loaded':
          worker.postMessage({ type: 'start-scan', data: { photoUrls } });
          break;

        case 'processing-photo':
          setProgress((p) => ({
            ...p,
            completed: msg.index,
            currentPhoto: `Photo ${msg.index + 1} of ${msg.total}`,
          }));
          await saveProgress({
            total: msg.total,
            completed: msg.index,
            facesFound: facesFoundRef.current,
            status: 'scanning',
            currentPhoto: `Photo ${msg.index + 1}`,
          });
          break;

        case 'face-detected':
          facesFoundRef.current += 1;
          setProgress((p) => ({ ...p, facesFound: p.facesFound + 1 }));
          await saveFaceResult(
            `photo-${msg.photoIndex}`,
            msg.descriptor,
            msg.boundingBox
          );
          break;

        case 'scan-complete':
          setProgress((p) => ({ ...p, status: 'clustering' }));
          await runClustering();
          setProgress((p) => ({ ...p, status: 'done' }));
          await saveProgress({
            total: photoUrls.length,
            completed: photoUrls.length,
            facesFound: facesFoundRef.current,
            status: 'done',
            currentPhoto: null,
          });
          queryClient.invalidateQueries({ queryKey: ['faces'] });
          break;

        case 'error':
          console.error('Face scan error:', msg.error);
          break;
      }
    };

    worker.postMessage({ type: 'load-models' });
  }, [queryClient]);

  const pauseScan = useCallback(() => {
    workerRef.current?.postMessage({ type: 'pause' });
    setProgress((p) => ({ ...p, status: 'paused' }));
  }, []);

  const resumeScan = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'resume' });
    setProgress((p) => ({ ...p, status: 'scanning' }));
  }, []);

  const resetScan = useCallback(async () => {
    await clearResults();
    setProgress({ total: 0, completed: 0, facesFound: 0, status: 'idle', currentPhoto: null });
  }, []);

  return { progress, startScan, pauseScan, resumeScan, resetScan };
}

async function runClustering() {
  const results = await getAllFaceResults();
  if (results.length === 0) return;

  const { clusterFaces } = await import('@/lib/clustering');
  const clusters = clusterFaces(
    results.map((r) => ({ descriptor: new Float32Array(r.descriptor), photo_id: r.photo_id })),
    0.5
  );

  await fetch('/api/faces/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clusters }),
  });
}

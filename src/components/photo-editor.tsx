'use client';

import { useState, useRef } from 'react';
import { IconCrop, IconRotate, IconFilter } from '@tabler/icons-react';

type FilterPreset = 'none' | 'vintage' | 'bw' | 'warm' | 'cool' | 'drama' | 'fade' | 'vivid';

const FILTERS: { id: FilterPreset; label: string; style: string }[] = [
  { id: 'none', label: 'Original', style: '' },
  { id: 'vintage', label: 'Vintage', style: 'sepia(30%) contrast(90%) brightness(95%)' },
  { id: 'bw', label: 'B&W', style: 'grayscale(100%) contrast(110%)' },
  { id: 'warm', label: 'Warm', style: 'sepia(15%) saturate(120%) brightness(105%)' },
  { id: 'cool', label: 'Cool', style: 'hue-rotate(200deg) saturate(90%) brightness(105%)' },
  { id: 'drama', label: 'Drama', style: 'contrast(130%) brightness(90%) saturate(110%)' },
  { id: 'fade', label: 'Fade', style: 'contrast(80%) brightness(110%) saturate(80%) opacity(90%)' },
  { id: 'vivid', label: 'Vivid', style: 'contrast(110%) saturate(150%) brightness(105%)' },
];

interface PhotoEditorProps {
  src: string;
  onSave: (edits: { crop?: any; rotation?: number; filter?: string }) => void;
}

export function PhotoEditor({ src, onSave }: PhotoEditorProps) {
  const [mode, setMode] = useState<'crop' | 'rotate' | 'filter'>('crop');
  const [rotation, setRotation] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<FilterPreset>('none');
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleFlipH = () => {
    setRotation((r) => r + 360);
  };

  const handleSave = () => {
    onSave({
      rotation,
      filter: currentFilter !== 'none' ? currentFilter : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt="Editing"
          style={{
            transform: `rotate(${rotation}deg)`,
            filter: FILTERS.find((f) => f.id === currentFilter)?.style,
            maxHeight: '50vh',
            objectFit: 'contain',
          }}
        />
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode('crop')}
          className={`rounded-md p-2 ${mode === 'crop' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
        >
          <IconCrop className="h-5 w-5" />
        </button>
        <button
          onClick={() => setMode('rotate')}
          className={`rounded-md p-2 ${mode === 'rotate' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
        >
          <IconRotate className="h-5 w-5" />
        </button>
        <button
          onClick={() => setMode('filter')}
          className={`rounded-md p-2 ${mode === 'filter' ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
        >
          <IconFilter className="h-5 w-5" />
        </button>
      </div>

      {mode === 'rotate' && (
        <div className="flex justify-center gap-4">
          <button onClick={handleRotate} className="text-sm underline">
            Rotate 90°
          </button>
          <button onClick={handleFlipH} className="text-sm underline">
            Flip H
          </button>
        </div>
      )}

      {mode === 'filter' && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCurrentFilter(filter.id)}
              className={`flex-shrink-0 rounded-md border px-3 py-1 text-xs ${
                currentFilter === filter.id ? 'border-foreground bg-foreground text-background' : ''
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
      >
        Save Edits
      </button>
    </div>
  );
}

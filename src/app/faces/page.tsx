import { FaceGroupsGrid } from '@/components/face-groups-grid';
import { FaceScanButton } from './scan-button';

export default function FacesPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">People</h1>
        <FaceScanButton />
      </div>
      <FaceGroupsGrid />
    </div>
  );
}

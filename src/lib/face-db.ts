import { openDB, type IDBPDatabase } from 'idb';

interface FaceDB {
  progress: {
    key: string;
    total: number;
    completed: number;
    facesFound: number;
    status: string;
    currentPhoto: string | null;
  };
  results: {
    key: string;
    photo_id: string;
    descriptor: number[];
    bounding_box: { x: number; y: number; width: number; height: number };
  };
}

let dbPromise: Promise<IDBPDatabase<FaceDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FaceDB>('face-scan', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('results')) {
          db.createObjectStore('results', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveProgress(progress: {
  total: number;
  completed: number;
  facesFound: number;
  status: string;
  currentPhoto: string | null;
}) {
  const db = await getDB();
  await db.put('progress', { key: 'current', ...progress });
}

export async function getProgress() {
  const db = await getDB();
  return db.get('progress', 'current');
}

export async function saveFaceResult(
  photoId: string,
  descriptor: number[],
  boundingBox: { x: number; y: number; width: number; height: number }
) {
  const db = await getDB();
  await db.put('results', {
    key: photoId,
    photo_id: photoId,
    descriptor,
    bounding_box: boundingBox,
  });
}

export async function getAllFaceResults() {
  const db = await getDB();
  return db.getAll('results');
}

export async function clearResults() {
  const db = await getDB();
  await db.clear('results');
  await db.clear('progress');
}

// DBSCAN implementation for face descriptor clustering

interface FacePoint {
  descriptor: Float32Array;
  photo_id: string;
}

function cosineDistance(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function clusterFaces(
  faces: FacePoint[],
  epsilon: number = 0.5,
  minPts: number = 2
): { clusterId: number; photoIds: string[] }[] {
  const n = faces.length;
  const visited = new Array(n).fill(false);
  const clusters: { clusterId: number; photoIds: string[] }[] = [];
  let clusterId = 0;

  function getNeighbors(idx: number): number[] {
    const neighbors: number[] = [];
    for (let j = 0; j < n; j++) {
      if (idx === j) continue;
      const dist = cosineDistance(faces[idx].descriptor, faces[j].descriptor);
      if (dist <= epsilon) neighbors.push(j);
    }
    return neighbors;
  }

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = getNeighbors(i);

    if (neighbors.length < minPts) continue;

    const cluster = { clusterId: clusterId++, photoIds: [faces[i].photo_id] };
    clusters.push(cluster);

    const seedQueue = [...neighbors];
    while (seedQueue.length > 0) {
      const j = seedQueue.pop()!;
      if (!visited[j]) {
        visited[j] = true;
        const jNeighbors = getNeighbors(j);
        if (jNeighbors.length >= minPts) {
          seedQueue.push(...jNeighbors);
        }
      }
      if (!cluster.photoIds.includes(faces[j].photo_id)) {
        cluster.photoIds.push(faces[j].photo_id);
      }
    }
  }

  return clusters;
}

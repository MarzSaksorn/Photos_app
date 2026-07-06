// Web Worker — face-api.js face detection + recognition
let modelsLoaded = false;
let paused = false;

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

async function loadModels() {
  if (modelsLoaded) return;
  (self as any).importScripts('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js');

  const faceapi = (self as any).faceapi;

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

async function processPhoto(photoUrl: string): Promise<any> {
  const faceapi = (self as any).faceapi;

  const response = await fetch(photoUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const detections = await faceapi
    .detectAllFaces(bitmap)
    .withFaceLandmarks()
    .withFaceDescriptors();

  bitmap.close();
  return detections;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  switch (type) {
    case 'start-scan':
      await loadModels();
      paused = false;
      self.postMessage({ type: 'models-loaded' });

      for (let i = 0; i < data.photoUrls.length; i++) {
        if (paused) break;

        const photoUrl = data.photoUrls[i];
        self.postMessage({ type: 'processing-photo', index: i, total: data.photoUrls.length });

        try {
          const detections = await processPhoto(photoUrl);

          for (const det of detections) {
            self.postMessage({
              type: 'face-detected',
              photoIndex: i,
              descriptor: Array.from(det.descriptor),
              boundingBox: {
                x: det.detection.box.x,
                y: det.detection.box.y,
                width: det.detection.box.width,
                height: det.detection.box.height,
              },
            });
          }
        } catch (err) {
          self.postMessage({ type: 'error', photoIndex: i, error: String(err) });
        }
      }

      self.postMessage({ type: 'scan-complete' });
      break;

    case 'pause':
      paused = true;
      break;

    case 'resume':
      paused = false;
      break;

    case 'load-models':
      await loadModels();
      self.postMessage({ type: 'models-loaded' });
      break;
  }
};

import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class FMHalftoning implements DitheringAlgorithm {
  dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const scale = config.scale as number;
    const threshold = config.threshold as number;
    const dotSize = config.dotSize as number;
    const randomness = config.randomness as number;

    // Create a new ImageData object with scaled dimensions
    const scaledWidth = Math.floor(width * scale);
    const scaledHeight = Math.floor(height * scale);
    const scaledData = new ImageData(scaledWidth, scaledHeight);

    // Scale down the image
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const srcIndex = (srcY * width + srcX) * 4;
        const destIndex = (y * scaledWidth + x) * 4;
        scaledData.data[destIndex] = scaledData.data[destIndex + 1] = scaledData.data[destIndex + 2] = data[srcIndex];
        scaledData.data[destIndex + 3] = 255;
      }
    }

    // Apply FM Halftoning
    for (let y = 0; y < scaledHeight; y += dotSize) {
      for (let x = 0; x < scaledWidth; x += dotSize) {
        let sum = 0;
        let count = 0;

        // Calculate average intensity for the current dot
        for (let dy = 0; dy < dotSize && y + dy < scaledHeight; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < scaledWidth; dx++) {
            const index = ((y + dy) * scaledWidth + (x + dx)) * 4;
            sum += scaledData.data[index];
            count++;
          }
        }

        const avgIntensity = sum / count;
        const shouldFillDot = avgIntensity < threshold + (Math.random() - 0.5) * randomness * 255;

        // Fill or clear the dot
        for (let dy = 0; dy < dotSize && y + dy < scaledHeight; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < scaledWidth; dx++) {
            const index = ((y + dy) * scaledWidth + (x + dx)) * 4;
            const value = shouldFillDot ? 0 : 255;
            scaledData.data[index] = scaledData.data[index + 1] = scaledData.data[index + 2] = value;
          }
        }
      }
    }

    // Scale up the halftoned image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.min(scaledWidth - 1, Math.floor(x * scale));
        const srcY = Math.min(scaledHeight - 1, Math.floor(y * scale));
        const srcIndex = (srcY * scaledWidth + srcX) * 4;
        const destIndex = (y * width + x) * 4;
        data[destIndex] = data[destIndex + 1] = data[destIndex + 2] = scaledData.data[srcIndex];
        data[destIndex + 3] = 255;
      }
    }

    return imageData;
  }
}

export const FMHalftoningStrategy: DitheringStrategy = {
  name: 'FM Halftoning',
  config: {
    name: 'FM Halftoning',
    algorithm: new FMHalftoning(),
    attributes: [
      { name: 'scale', type: 'range', min: 0.1, max: 1, step: 0.1, default: 1 },
      { name: 'threshold', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { name: 'dotSize', type: 'range', min: 1, max: 10, step: 1, default: 2 },
      { name: 'randomness', type: 'range', min: 0, max: 1, step: 0.1, default: 0.2 },
    ],
  },
};
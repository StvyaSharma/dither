import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class CheckerboardDithering implements DitheringAlgorithm {
  dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const scale = config.scale as number;
    const threshold = config.threshold as number;
    const checkerboardSize = Math.max(1, Math.floor(config.checkerboardSize as number));
    const invertPattern = config.invertPattern as boolean;

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

    // Apply checkerboard dithering
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const checkerValue = ((Math.floor(x / checkerboardSize) + Math.floor(y / checkerboardSize)) % 2 === 0) !== invertPattern;
        const pixelThreshold = checkerValue ? threshold : 255 - threshold;
        const newPixel = scaledData.data[i] < pixelThreshold ? 0 : 255;
        scaledData.data[i] = scaledData.data[i + 1] = scaledData.data[i + 2] = newPixel;
      }
    }

    // Scale up the dithered image
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

export const CheckerboardDitheringStrategy: DitheringStrategy = {
  name: 'Checkerboard',
  config: {
    name: 'Checkerboard',
    algorithm: new CheckerboardDithering(),
    attributes: [
      { name: 'scale', type: 'range', min: 0.1, max: 1, step: 0.1, default: 1 },
      { name: 'threshold', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { name: 'checkerboardSize', type: 'range', min: 1, max: 20, step: 1, default: 2 },
      { name: 'invertPattern', type: 'boolean', default: false },
    ],
  },
};
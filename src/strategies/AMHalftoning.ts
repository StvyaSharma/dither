import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class AMHalftoning implements DitheringAlgorithm {
  dither(imageData: ImageData, config: Record<string, number>): ImageData {
    const { width, height } = imageData;
    const {
      dotSize,
      screenFrequency,
      scale,
      quantizationLevels
    } = config;

    console.log('Starting AM Halftoning');
    console.log('Image dimensions:', width, 'x', height);
    console.log('Config:', config);

    // Scale the image
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
        for (let i = 0; i < 3; i++) {
          scaledData.data[destIndex + i] = imageData.data[srcIndex + i];
        }
        scaledData.data[destIndex + 3] = 255; // Alpha
      }
    }

    const cellSize = Math.max(2, Math.floor(25.4 / screenFrequency));
    console.log('Cell size:', cellSize);

    const quantize = (value: number): number => {
      const step = 255 / (quantizationLevels - 1);
      return Math.round(value / step) * step;
    };

    const createAMHalftonePattern = (x: number, y: number, value: number): number => {
      const cellX = x % cellSize;
      const cellY = y % cellSize;
      const centerX = cellSize / 2;
      const centerY = cellSize / 2;
      const distance = Math.sqrt((cellX - centerX) ** 2 + (cellY - centerY) ** 2);
      const maxDistance = Math.sqrt(2) * (cellSize / 2);
      const normalizedValue = value / 255;
      const threshold = maxDistance * (1 - normalizedValue) * dotSize;
      return distance <= threshold ? 255 : 0; // Note: 255 for dot, 0 for background
    };

    let totalPixels = 0;
    let dotPixels = 0;

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const pixelValue = (scaledData.data[i] + scaledData.data[i + 1] + scaledData.data[i + 2]) / 3;
        
        const quantizedValue = quantize(pixelValue);
        const halftoneValue = createAMHalftonePattern(x, y, quantizedValue);

        for (let j = 0; j < 3; j++) {
          scaledData.data[i + j] = halftoneValue;
        }
        
        totalPixels++;
        if (halftoneValue > 0) dotPixels++;
      }
    }

    console.log('Halftoning complete');
    console.log('Total pixels:', totalPixels);
    console.log('Dot pixels:', dotPixels);
    console.log('Percentage of dot pixels:', (dotPixels / totalPixels * 100).toFixed(2) + '%');

    // Scale up the halftoned image if necessary
    if (scale !== 1) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcX = Math.min(scaledWidth - 1, Math.floor(x * scale));
          const srcY = Math.min(scaledHeight - 1, Math.floor(y * scale));
          const srcIndex = (srcY * scaledWidth + srcX) * 4;
          const destIndex = (y * width + x) * 4;
          for (let i = 0; i < 3; i++) {
            imageData.data[destIndex + i] = scaledData.data[srcIndex + i];
          }
          imageData.data[destIndex + 3] = 255; // Alpha
        }
      }
    } else {
      imageData.data.set(scaledData.data);
    }

    return imageData;
  }
}

export const AMHalftoningStrategy: DitheringStrategy = {
  name: 'AM Halftoning',
  config: {
    name: 'AM Halftoning',
    algorithm: new AMHalftoning(),
    attributes: [
      { name: 'dotSize', type: 'range', min: 0.1, max: 2, step: 0.1, default: 1 },
      { name: 'screenFrequency', type: 'range', min: 1, max: 300, step: 1, default: 60 },
      { name: 'scale', type: 'range', min: 0.1, max: 1, step: 0.1, default: 1 },
      { name: 'quantizationLevels', type: 'range', min: 2, max: 256, step: 1, default: 256 },
    ],
  },
};
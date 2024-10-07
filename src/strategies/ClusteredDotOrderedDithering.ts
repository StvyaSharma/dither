import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class ClusteredDotOrderedDithering implements DitheringAlgorithm {
  private generateBayerMatrix(n: number): number[][] {
    n = Math.max(1, Math.min(8, n)); // Clamp n between 1 and 8
    let size = 1;
    let matrix: number[][] = [[0]];

    for (let i = 0; i < n; i++) {
      size *= 2;
      const newMatrix: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const quadrant = 2 * (Math.floor(y / (size / 2)) % 2) + (Math.floor(x / (size / 2)) % 2);
          newMatrix[y][x] = 4 * matrix[y % (size / 2)][x % (size / 2)] + quadrant;
        }
      }

      matrix = newMatrix;
    }

    return matrix;
  }

  dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const quantizationLevels = config.quantizationLevels as number;
    const threshold = config.threshold as number;
    const scale = config.scale as number;
    const matrixSize = Math.min(8, Math.max(1, config.matrixSize as number));
    const ditheringStrength = config.ditheringStrength as number;

    const bayerMatrix = this.generateBayerMatrix(matrixSize);
    const matrixDimension = bayerMatrix.length;

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

    const quantize = (value: number): number => {
      const step = 255 / (quantizationLevels - 1);
      return Math.round(Math.round(value / step) * step);
    };

    const thresholdValue = (value: number, x: number, y: number): number => {
      const matrixValue = bayerMatrix[y % matrixDimension][x % matrixDimension] / (matrixDimension * matrixDimension);
      const adjustedThreshold = threshold / 255 + (matrixValue - 0.5) * ditheringStrength;
      return value / 255 > adjustedThreshold ? 255 : 0;
    };

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const oldPixel = scaledData.data[i];
        const newPixel = thresholdValue(quantize(oldPixel), x, y);
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

export const ClusteredDotOrderedDitheringStrategy: DitheringStrategy = {
  name: 'Clustered Dot Ordered',
  config: {
    name: 'Clustered Dot Ordered',
    algorithm: new ClusteredDotOrderedDithering(),
    attributes: [
      { name: 'scale', type: 'range', min: 0.1, max: 1, step: 0.1, default: 1 },
      { name: 'quantizationLevels', type: 'range', min: 2, max: 16, step: 1, default: 2 },
      { name: 'threshold', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { name: 'ditheringStrength', type: 'range', min: 0, max: 2, step: 0.1, default: 1 },
      { name: 'matrixSize', type: 'range', min: 1, max: 8, step: 1, default: 2 },
    ],
  },
};
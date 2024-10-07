import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class VoidAndClusterDithering implements DitheringAlgorithm {
  private static readonly MATRIX_SIZE = 64;
  private static ditheringMatrix: number[][] | null = null;

  dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const quantizationLevels = config.quantizationLevels as number;
    const threshold = config.threshold as number;
    const errorPropagationFactor = config.errorPropagationFactor as number;
    const ditheringStrength = config.ditheringStrength as number;
    const clusteringStrength = config.clusteringStrength as number;
    const voidSelectionMethod = config.voidSelectionMethod as number;

    // Create or update the dithering matrix if necessary
    if (!VoidAndClusterDithering.ditheringMatrix) {
      VoidAndClusterDithering.ditheringMatrix = this.createVoidAndClusterMatrix(
        VoidAndClusterDithering.MATRIX_SIZE,
        clusteringStrength,
        voidSelectionMethod
      );
    }

    const matrix = VoidAndClusterDithering.ditheringMatrix;
    const matrixSize = VoidAndClusterDithering.MATRIX_SIZE;

    const quantize = (value: number): number => {
      const step = 255 / (quantizationLevels - 1);
      return Math.round(Math.round(value / step) * step);
    };

    const thresholdValue = (value: number): number => {
      return value < threshold ? 0 : 255;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const oldPixel = data[i];
        const matrixValue = matrix[y % matrixSize][x % matrixSize] / (matrixSize * matrixSize);
        const newPixel = thresholdValue(quantize(oldPixel + (matrixValue - 0.5) * ditheringStrength * 255));
        data[i] = data[i + 1] = data[i + 2] = newPixel;

        const error = (oldPixel - newPixel) * errorPropagationFactor;

        // Simplified error diffusion (Floyd-Steinberg)
        if (x < width - 1) data[i + 4] += error * 7 / 16;
        if (y < height - 1) {
          if (x > 0) data[i + width * 4 - 4] += error * 3 / 16;
          data[i + width * 4] += error * 5 / 16;
          if (x < width - 1) data[i + width * 4 + 4] += error * 1 / 16;
        }
      }
    }

    return imageData;
  }

  private createVoidAndClusterMatrix(size: number, clusteringStrength: number, voidSelectionMethod: number): number[][] {
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
    const visited = new Set<number>();
    
    const getClusterValue = (x: number, y: number): number => {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = (x + dx + size) % size;
          const ny = (y + dy + size) % size;
          sum += matrix[ny][nx];
        }
      }
      return sum;
    };

    const findExtreme = (isVoid: boolean): [number, number] => {
      let extremeValue = isVoid ? Infinity : -Infinity;
      let extremeX = 0, extremeY = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (!visited.has(y * size + x)) {
            const value = getClusterValue(x, y);
            if (isVoid ? value < extremeValue : value > extremeValue) {
              extremeValue = value;
              extremeX = x;
              extremeY = y;
            }
          }
        }
      }
      return [extremeX, extremeY];
    };

    // Initialize with random points
    for (let i = 0; i < size * size / 10; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      matrix[y][x] = 1;
      visited.add(y * size + x);
    }

    // Void-and-cluster process
    for (let i = visited.size; i < size * size; i++) {
      const [x, y] = findExtreme(Math.random() < voidSelectionMethod);
      matrix[y][x] = i + 1;
      visited.add(y * size + x);
    }

    // Apply clustering strength
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        matrix[y][x] = Math.pow(matrix[y][x] / (size * size), clusteringStrength) * (size * size);
      }
    }

    return matrix;
  }
}

export const VoidAndClusterDitheringStrategy: DitheringStrategy = {
  name: 'Void-and-Cluster',
  config: {
    name: 'Void-and-Cluster',
    algorithm: new VoidAndClusterDithering(),
    attributes: [
      { name: 'quantizationLevels', type: 'range', min: 2, max: 16, step: 1, default: 2 },
      { name: 'threshold', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { name: 'errorPropagationFactor', type: 'range', min: 0, max: 1, step: 0.1, default: 0.8 },
      { name: 'ditheringStrength', type: 'range', min: 0, max: 2, step: 0.1, default: 1 },
      { name: 'clusteringStrength', type: 'range', min: 0.1, max: 2, step: 0.1, default: 1 },
      { name: 'voidSelectionMethod', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5 },
    ],
  },
};
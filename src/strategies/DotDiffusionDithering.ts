import { DitheringAlgorithm, DitheringStrategy } from "../types/dithering";
/**
 * Class representing the Dot Diffusion Dithering algorithm.
 * Implements the DitheringAlgorithm interface.
 */
class DotDiffusionDithering implements DitheringAlgorithm {
  dither(
    imageData: ImageData,
    config: Record<string, number | boolean>,
  ): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const quantizationLevels = config.quantizationLevels as number;
    const threshold = config.threshold as number;
    const scale = config.scale as number;
    const diffusionFactor = config.diffusionFactor as number;
    const classMatrixSize = config.classMatrixSize as number;

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
        scaledData.data[destIndex] =
          scaledData.data[destIndex + 1] =
          scaledData.data[destIndex + 2] =
            data[srcIndex];
        scaledData.data[destIndex + 3] = 255;
      }
    }

    const quantize = (value: number): number => {
      const step = 255 / (quantizationLevels - 1);
      return Math.round(Math.round(value / step) * step);
    };

    const thresholdValue = (value: number): number => {
      return value < threshold ? 0 : 255;
    };

    // Generate class matrix
    const classMatrix = this.generateClassMatrix(classMatrixSize);

    // Process the image
    for (
      let classIndex = 0;
      classIndex < classMatrixSize * classMatrixSize;
      classIndex++
    ) {
      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          if (
            classMatrix[y % classMatrixSize][x % classMatrixSize] === classIndex
          ) {
            const i = (y * scaledWidth + x) * 4;
            const oldPixel = scaledData.data[i];
            const newPixel = thresholdValue(quantize(oldPixel));
            scaledData.data[i] =
              scaledData.data[i + 1] =
              scaledData.data[i + 2] =
                newPixel;
            const error = (oldPixel - newPixel) * diffusionFactor;

            this.diffuseError(
              scaledData,
              x,
              y,
              error,
              scaledWidth,
              scaledHeight,
              classMatrix,
              classIndex,
            );
          }
        }
      }
    }

    // Scale up the dithered image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.min(scaledWidth - 1, Math.floor(x * scale));
        const srcY = Math.min(scaledHeight - 1, Math.floor(y * scale));
        const srcIndex = (srcY * scaledWidth + srcX) * 4;
        const destIndex = (y * width + x) * 4;
        data[destIndex] =
          data[destIndex + 1] =
          data[destIndex + 2] =
            scaledData.data[srcIndex];
        data[destIndex + 3] = 255;
      }
    }

    return imageData;
  }

  private generateClassMatrix(size: number): number[][] {
    const matrix: number[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));
    let value = 0;
    const totalCells = size * size;

    for (let i = 0; i < totalCells; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * size);
        col = Math.floor(Math.random() * size);
      } while (matrix[row][col] !== 0);

      matrix[row][col] = value;
      value++;
    }

    return matrix;
  }

  private diffuseError(
    data: ImageData,
    x: number,
    y: number,
    error: number,
    width: number,
    height: number,
    classMatrix: number[][],
    currentClass: number,
  ): void {
    const diffusionPattern = [
      { dx: 1, dy: 0, weight: 7 / 16 },
      { dx: -1, dy: 1, weight: 3 / 16 },
      { dx: 0, dy: 1, weight: 5 / 16 },
      { dx: 1, dy: 1, weight: 1 / 16 },
    ];

    for (const { dx, dy, weight } of diffusionPattern) {
      const newX = x + dx;
      const newY = y + dy;

      if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
        const neighborClass =
          classMatrix[newY % classMatrix.length][newX % classMatrix.length];
        if (neighborClass > currentClass) {
          const index = (newY * width + newX) * 4;
          data.data[index] = Math.max(
            0,
            Math.min(255, data.data[index] + error * weight),
          );
        }
      }
    }
  }
}

export const DotDiffusionDitheringStrategy: DitheringStrategy = {
  name: "Dot Diffusion",
  config: {
    name: "Dot Diffusion",
    algorithm: new DotDiffusionDithering(),
    attributes: [
      { name: "scale", type: "range", min: 0.1, max: 1, step: 0.1, default: 1 },
      {
        name: "quantizationLevels",
        type: "range",
        min: 2,
        max: 16,
        step: 1,
        default: 2,
      },
      {
        name: "threshold",
        type: "range",
        min: 0,
        max: 255,
        step: 1,
        default: 128,
      },
      {
        name: "diffusionFactor",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.8,
      },
      {
        name: "classMatrixSize",
        type: "range",
        min: 2,
        max: 8,
        step: 1,
        default: 4,
      },
    ],
  },
};

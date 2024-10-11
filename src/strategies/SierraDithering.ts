import { DitheringAlgorithm, DitheringStrategy } from "../types/dithering";

class SierraDithering implements DitheringAlgorithm {
  private kernel: number[][];
  private divisor: number;

  constructor(kernel: number[][], divisor: number) {
    this.kernel = kernel;
    this.divisor = divisor;
  }

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
    const errorPropagationFactor = config.errorPropagationFactor as number;
    const ditheringStrength = config.ditheringStrength as number;
    const serpentineProcessing = config.serpentineProcessing as boolean;

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

    const distributeError = (
      x: number,
      y: number,
      error: number,
      weight: number,
    ) => {
      if (x >= 0 && x < scaledWidth && y >= 0 && y < scaledHeight) {
        const index = (y * scaledWidth + x) * 4;
        scaledData.data[index] +=
          (error * weight * errorPropagationFactor * ditheringStrength) /
          this.divisor;
      }
    };

    for (let y = 0; y < scaledHeight; y++) {
      const reverse = serpentineProcessing && y % 2 === 1;
      for (let x = 0; x < scaledWidth; x++) {
        const actualX = reverse ? scaledWidth - 1 - x : x;
        const i = (y * scaledWidth + actualX) * 4;
        const oldPixel = scaledData.data[i];
        const newPixel = thresholdValue(quantize(oldPixel));
        scaledData.data[i] =
          scaledData.data[i + 1] =
          scaledData.data[i + 2] =
            newPixel;
        const error = oldPixel - newPixel;

        for (let ky = 0; ky < this.kernel.length; ky++) {
          for (let kx = 0; kx < this.kernel[ky].length; kx++) {
            const weight = this.kernel[ky][kx];
            if (weight !== 0) {
              const dx = reverse ? -kx : kx;
              distributeError(actualX + dx, y + ky, error, weight);
            }
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
}

const sierra3Kernel = [
  [0, 0, 0, 5, 3],
  [2, 4, 5, 4, 2],
  [0, 2, 3, 2, 0],
];

const sierra2Kernel = [
  [0, 0, 0, 4, 3],
  [1, 2, 3, 2, 1],
];

const sierraLiteKernel = [
  [0, 0, 2],
  [1, 1, 0],
];

export const Sierra3DitheringStrategy: DitheringStrategy = {
  name: "Sierra-3",
  config: {
    name: "Sierra-3",
    algorithm: new SierraDithering(sierra3Kernel, 32),
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
        name: "errorPropagationFactor",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        default: 1,
      },
      {
        name: "ditheringStrength",
        type: "range",
        min: 0,
        max: 2,
        step: 0.1,
        default: 1,
      },
      { name: "serpentineProcessing", type: "boolean", default: false },
    ],
  },
};

export const Sierra2DitheringStrategy: DitheringStrategy = {
  name: "Sierra-2",
  config: {
    name: "Sierra-2",
    algorithm: new SierraDithering(sierra2Kernel, 16),
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
        name: "errorPropagationFactor",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        default: 1,
      },
      {
        name: "ditheringStrength",
        type: "range",
        min: 0,
        max: 2,
        step: 0.1,
        default: 1,
      },
      { name: "serpentineProcessing", type: "boolean", default: false },
    ],
  },
};

export const SierraLiteDitheringStrategy: DitheringStrategy = {
  name: "Sierra Lite",
  config: {
    name: "Sierra Lite",
    algorithm: new SierraDithering(sierraLiteKernel, 4),
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
        name: "errorPropagationFactor",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        default: 1,
      },
      {
        name: "ditheringStrength",
        type: "range",
        min: 0,
        max: 2,
        step: 0.1,
        default: 1,
      },
      { name: "serpentineProcessing", type: "boolean", default: false },
    ],
  },
};

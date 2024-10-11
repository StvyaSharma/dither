import { DitheringAlgorithm, DitheringStrategy } from "../types/dithering";

class StochasticScreeningDithering implements DitheringAlgorithm {
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
    const noiseIntensity = config.noiseIntensity as number;
    const ditheringStrength = config.ditheringStrength as number;

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

    const thresholdValue = (value: number, noise: number): number => {
      return value + noise < threshold ? 0 : 255;
    };

    // Stochastic screening dithering
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const oldPixel = scaledData.data[i];

        // Generate random noise
        const noise = (Math.random() - 0.5) * 2 * noiseIntensity * 255;

        // Apply dithering with noise
        const newPixel = thresholdValue(
          quantize(oldPixel),
          noise * ditheringStrength,
        );

        scaledData.data[i] =
          scaledData.data[i + 1] =
          scaledData.data[i + 2] =
            newPixel;
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

export const StochasticScreeningDitheringStrategy: DitheringStrategy = {
  name: "Stochastic Screening",
  config: {
    name: "Stochastic Screening",
    algorithm: new StochasticScreeningDithering(),
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
        name: "noiseIntensity",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.5,
      },
      {
        name: "ditheringStrength",
        type: "range",
        min: 0,
        max: 2,
        step: 0.1,
        default: 1,
      },
    ],
  },
};

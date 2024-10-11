import { DitheringAlgorithm, DitheringStrategy } from "../types/dithering";

class LatticeBoltzmannDithering implements DitheringAlgorithm {
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
    const relaxationTime = config.relaxationTime as number;
    const iterationCount = config.iterationCount as number;
    const diffusionStrength = config.diffusionStrength as number;

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

    // Initialize lattice
    const lattice = new Array(scaledHeight)
      .fill(null)
      .map(() => new Array(scaledWidth).fill(0));

    // Lattice-Boltzmann algorithm
    for (let iter = 0; iter < iterationCount; iter++) {
      // Collision step
      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          const index = (y * scaledWidth + x) * 4;
          const pixelValue = scaledData.data[index];
          const equilibrium = quantize(pixelValue);
          lattice[y][x] += (equilibrium - lattice[y][x]) / relaxationTime;
        }
      }

      // Streaming step
      const newLattice = new Array(scaledHeight)
        .fill(null)
        .map(() => new Array(scaledWidth).fill(0));
      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          const neighbors = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: 1, dy: -1 },
            { dx: 1, dy: 1 },
          ];

          neighbors.forEach(({ dx, dy }) => {
            const nx = (x + dx + scaledWidth) % scaledWidth;
            const ny = (y + dy + scaledHeight) % scaledHeight;
            newLattice[ny][nx] += (lattice[y][x] * diffusionStrength) / 8;
          });

          newLattice[y][x] += lattice[y][x] * (1 - diffusionStrength);
        }
      }

      lattice.splice(0, lattice.length, ...newLattice);
    }

    // Apply dithering result
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const index = (y * scaledWidth + x) * 4;
        const newPixel = thresholdValue(lattice[y][x]);
        scaledData.data[index] =
          scaledData.data[index + 1] =
          scaledData.data[index + 2] =
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

export const LatticeBoltzmannDitheringStrategy: DitheringStrategy = {
  name: "Lattice-Boltzmann",
  config: {
    name: "Lattice-Boltzmann",
    algorithm: new LatticeBoltzmannDithering(),
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
        name: "relaxationTime",
        type: "range",
        min: 0.1,
        max: 2,
        step: 0.1,
        default: 1,
      },
      {
        name: "iterationCount",
        type: "range",
        min: 1,
        max: 50,
        step: 1,
        default: 10,
      },
      {
        name: "diffusionStrength",
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.5,
      },
    ],
  },
};

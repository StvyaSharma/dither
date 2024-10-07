import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class AdditiveNoiseDithering implements DitheringAlgorithm {
  dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const quantizationLevels = config.quantizationLevels as number;
    const threshold = config.threshold as number;
    const scale = config.scale as number;
    const noiseStrength = config.noiseStrength as number;
    const preserveOriginalColor = config.preserveOriginalColor as boolean;

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
        for (let i = 0; i < 3; i++) {
          scaledData.data[destIndex + i] = data[srcIndex + i];
        }
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

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        for (let c = 0; c < 3; c++) {
          const oldPixel = scaledData.data[i + c];
          const noise = (Math.random() - 0.5) * 2 * noiseStrength * 255;
          const noisyPixel = Math.max(0, Math.min(255, oldPixel + noise));
          const newPixel = thresholdValue(quantize(noisyPixel));
          scaledData.data[i + c] = preserveOriginalColor ? 
            (newPixel === 255 ? oldPixel : 0) : newPixel;
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
        for (let i = 0; i < 3; i++) {
          data[destIndex + i] = scaledData.data[srcIndex + i];
        }
        data[destIndex + 3] = 255;
      }
    }

    return imageData;
  }
}

export const AdditiveNoiseDitheringStrategy: DitheringStrategy = {
  name: 'Additive Noise',
  config: {
    name: 'Additive Noise',
    algorithm: new AdditiveNoiseDithering(),
    attributes: [
      { name: 'scale', type: 'range', min: 0.1, max: 1, step: 0.1, default: 1 },
      { name: 'quantizationLevels', type: 'range', min: 2, max: 16, step: 1, default: 2 },
      { name: 'threshold', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { name: 'noiseStrength', type: 'range', min: 0, max: 1, step: 0.01, default: 0.5 },
      { name: 'preserveOriginalColor', type: 'boolean', default: false },
    ],
  },
};
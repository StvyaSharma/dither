import { DitheringAlgorithm, DitheringStrategy } from '../types/dithering';

class WhiteNoiseDithering implements DitheringAlgorithm {
  dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const quantizationLevels = config.quantizationLevels as number;
    const threshold = config.threshold as number;
    const noiseIntensity = config.noiseIntensity as number;
    const preserveGrays = config.preserveGrays as boolean;

    const quantize = (value: number): number => {
      const step = 255 / (quantizationLevels - 1);
      return Math.round(Math.round(value / step) * step);
    };

    const thresholdValue = (value: number, noise: number): number => {
      const adjustedThreshold = threshold + noise;
      return value < adjustedThreshold ? 0 : 255;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const grayValue = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Generate random noise
        const noise = (Math.random() - 0.5) * 2 * noiseIntensity * 255;
        
        let newValue: number;
        if (preserveGrays && (grayValue < 10 || grayValue > 245)) {
          // Preserve very dark and very light areas
          newValue = grayValue;
        } else {
          newValue = thresholdValue(quantize(grayValue), noise);
        }
        
        data[i] = data[i + 1] = data[i + 2] = newValue;
      }
    }

    return imageData;
  }
}

export const WhiteNoiseDitheringStrategy: DitheringStrategy = {
  name: 'White Noise',
  config: {
    name: 'White Noise',
    algorithm: new WhiteNoiseDithering(),
    attributes: [
      { name: 'quantizationLevels', type: 'range', min: 2, max: 16, step: 1, default: 2 },
      { name: 'threshold', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { name: 'noiseIntensity', type: 'range', min: 0, max: 1, step: 0.01, default: 0.5 },
      { name: 'preserveGrays', type: 'boolean', default: false },
    ],
  },
};
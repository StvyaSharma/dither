export interface DitheringStrategy {
    applyDithering(imageDataUrl: string, options: { intensity: number; threshold?: number }): string;
  }
  
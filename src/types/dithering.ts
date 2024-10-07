// types/dithering.ts

export interface DitherConfig {
    name: string;
    algorithm: DitheringAlgorithm;
    attributes: DitheringAttribute[];
  }
  
  export interface DitheringAttribute {
    name: string;
    type: 'range' | 'boolean';
    min?: number;
    max?: number;
    step?: number;
    default: number | boolean;
  }
  
  export interface DitheringAlgorithm {
    dither(imageData: ImageData, config: Record<string, number | boolean>): ImageData;
  }
  
  export type DitheringStrategy = {
    name: string;
    config: DitherConfig;
  };
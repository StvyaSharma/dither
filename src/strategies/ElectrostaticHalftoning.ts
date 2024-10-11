import { DitheringAlgorithm, DitheringStrategy } from "../types/dithering";

class ElectrostaticHalftoning implements DitheringAlgorithm {
  dither(
    imageData: ImageData,
    config: Record<string, number | boolean>,
  ): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const scale = config.scale as number;
    const chargeStrength = config.chargeStrength as number;
    const particleSize = config.particleSize as number;
    const iterations = config.iterations as number;
    const threshold = config.threshold as number;

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

    // Initialize particle positions
    const particles: { x: number; y: number }[] = [];
    for (
      let i = 0;
      i < (scaledWidth * scaledHeight) / (particleSize * particleSize);
      i++
    ) {
      particles.push({
        x: Math.random() * scaledWidth,
        y: Math.random() * scaledHeight,
      });
    }

    // Simulate electrostatic repulsion
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < particles.length; i++) {
        let fx = 0,
          fy = 0;
        for (let j = 0; j < particles.length; j++) {
          if (i !== j) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 0) {
              const force = chargeStrength / distSq;
              fx += force * dx;
              fy += force * dy;
            }
          }
        }
        particles[i].x += fx;
        particles[i].y += fy;

        // Keep particles within bounds
        particles[i].x = Math.max(0, Math.min(scaledWidth - 1, particles[i].x));
        particles[i].y = Math.max(
          0,
          Math.min(scaledHeight - 1, particles[i].y),
        );
      }
    }

    // Create dithered image
    const result = new ImageData(scaledWidth, scaledHeight);
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const i = (y * scaledWidth + x) * 4;
        const brightness = scaledData.data[i] / 255;
        let isParticle = false;

        for (const particle of particles) {
          const dx = x - particle.x;
          const dy = y - particle.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < particleSize * particleSize * brightness) {
            isParticle = true;
            break;
          }
        }

        const pixelValue = isParticle
          ? scaledData.data[i] < threshold
            ? 0
            : 255
          : 255;
        result.data[i] = result.data[i + 1] = result.data[i + 2] = pixelValue;
        result.data[i + 3] = 255;
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
            result.data[srcIndex];
        data[destIndex + 3] = 255;
      }
    }

    return imageData;
  }
}

export const ElectrostaticHalftoningStrategy: DitheringStrategy = {
  name: "Electrostatic Halftoning",
  config: {
    name: "Electrostatic Halftoning",
    algorithm: new ElectrostaticHalftoning(),
    attributes: [
      { name: "scale", type: "range", min: 0.1, max: 1, step: 0.1, default: 1 },
      {
        name: "chargeStrength",
        type: "range",
        min: 0.1,
        max: 10,
        step: 0.1,
        default: 1,
      },
      {
        name: "particleSize",
        type: "range",
        min: 1,
        max: 10,
        step: 1,
        default: 3,
      },
      {
        name: "iterations",
        type: "range",
        min: 1,
        max: 100,
        step: 1,
        default: 20,
      },
      {
        name: "threshold",
        type: "range",
        min: 0,
        max: 255,
        step: 1,
        default: 128,
      },
    ],
  },
};

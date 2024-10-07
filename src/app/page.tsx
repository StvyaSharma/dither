"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DitherEffect = 'Atkinson' | 'Floyd-Steinberg';

const ImageDithering: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [effect, setEffect] = useState<DitherEffect>('Atkinson');
  const [scale, setScale] = useState(1);
  const [quantizationLevels, setQuantizationLevels] = useState(2);
  const [threshold, setThreshold] = useState(128);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        const img = new Image();
        img.onload = () => {
          originalImageRef.current = img;
          applyDithering();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyDithering = () => {
    if (!originalImageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = originalImageRef.current;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply dithering effect based on selected effect and parameters
    const scaledWidth = Math.floor(canvas.width * scale);
    const scaledHeight = Math.floor(canvas.height * scale);
    const scaledData = new Uint8ClampedArray(scaledWidth * scaledHeight * 4);

    // Scale down the image
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);
        const srcIndex = (srcY * canvas.width + srcX) * 4;
        const destIndex = (y * scaledWidth + x) * 4;
        scaledData[destIndex] = scaledData[destIndex + 1] = scaledData[destIndex + 2] = data[srcIndex];
        scaledData[destIndex + 3] = 255;
      }
    }

    switch (effect) {
      case 'Atkinson':
        atkinsonDithering(scaledData, scaledWidth, scaledHeight);
        break;
      case 'Floyd-Steinberg':
        floydSteinbergDithering(scaledData, scaledWidth, scaledHeight);
        break;
    }

    // Scale up the dithered image
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const srcX = Math.min(scaledWidth - 1, Math.floor(x * scale));
        const srcY = Math.min(scaledHeight - 1, Math.floor(y * scale));
        const srcIndex = (srcY * scaledWidth + srcX) * 4;
        const destIndex = (y * canvas.width + x) * 4;
        data[destIndex] = data[destIndex + 1] = data[destIndex + 2] = scaledData[srcIndex];
        data[destIndex + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const quantize = (value: number): number => {
    const step = 255 / (quantizationLevels - 1);
    return Math.round(Math.round(value / step) * step);
  };

  const thresholdValue = (value: number): number => {
    return value < threshold ? 0 : 255;
  };

  const atkinsonDithering = (data: Uint8ClampedArray, width: number, height: number) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const oldPixel = data[i];
        const newPixel = thresholdValue(quantize(oldPixel));
        data[i] = data[i + 1] = data[i + 2] = newPixel;
        const error = (oldPixel - newPixel) / 8;

        if (x + 1 < width) data[i + 4] += error;
        if (x + 2 < width) data[i + 8] += error;
        if (y + 1 < height) {
          data[i + width * 4] += error;
          if (x - 1 > 0) data[i + width * 4 - 4] += error;
          if (x + 1 < width) data[i + width * 4 + 4] += error;
        }
        if (y + 2 < height) data[i + width * 8] += error;
      }
    }
  };

  const floydSteinbergDithering = (data: Uint8ClampedArray, width: number, height: number) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const oldPixel = data[i];
        const newPixel = thresholdValue(quantize(oldPixel));
        data[i] = data[i + 1] = data[i + 2] = newPixel;
        const error = oldPixel - newPixel;

        if (x + 1 < width) data[i + 4] += error * 7 / 16;
        if (y + 1 < height) {
          if (x - 1 > 0) data[i + width * 4 - 4] += error * 3 / 16;
          data[i + width * 4] += error * 5 / 16;
          if (x + 1 < width) data[i + width * 4 + 4] += error * 1 / 16;
        }
      }
    }
  };

  const exportImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'dithered_image.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    if (originalImageRef.current) {
      applyDithering();
    }
  }, [image, effect, scale, quantizationLevels, threshold]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Dithering</h1>
      <div className="mb-4">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
        <Select onValueChange={(value) => setEffect(value as DitherEffect)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select effect" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Atkinson">Atkinson</SelectItem>
            <SelectItem value="Floyd-Steinberg">Floyd-Steinberg</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2">Scale</label>
          <Slider
            min={0.1}
            max={1}
            step={0.1}
            value={[scale]}
            onValueChange={([value]) => setScale(value)}
          />
        </div>
        <div>
          <label className="block mb-2">Quantization Levels</label>
          <Slider
            min={2}
            max={16}
            step={1}
            value={[quantizationLevels]}
            onValueChange={([value]) => setQuantizationLevels(value)}
          />
        </div>
        <div>
          <label className="block mb-2">Threshold</label>
          <Slider
            min={0}
            max={255}
            step={1}
            value={[threshold]}
            onValueChange={([value]) => setThreshold(value)}
          />
        </div>
      </div>
      <div className="mt-4">
        <canvas ref={canvasRef} className="max-w-full h-auto border border-gray-300" />
      </div>
      <Button onClick={exportImage} className="mt-4">Export Dithered Image</Button>
    </div>
  );
};

export default ImageDithering;
// components/ImageDithering.tsx

"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DitherControls from '@/components/DitherControls';
import { ditheringStrategies } from '../strategies/ditheringStrategies';
import { DitheringStrategy } from '../types/dithering';

const ImageDithering: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<DitheringStrategy>(ditheringStrategies[0]);
  const [config, setConfig] = useState<Record<string, number | boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const initialConfig: Record<string, number | boolean> = {};
    strategy.config.attributes.forEach((attr) => {
      initialConfig[attr.name] = attr.default;
    });
    setConfig(initialConfig);
  }, [strategy]);

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
    const ditheredImageData = strategy.config.algorithm.dither(imageData, config);

    ctx.putImageData(ditheredImageData, 0, 0);
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
  }, [image, strategy, config]);

  const handleConfigChange = (name: string, value: number | boolean) => {
    setConfig((prevConfig) => ({ ...prevConfig, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Dithering</h1>
      <div className="mb-4">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
        <Select onValueChange={(value) => setStrategy(ditheringStrategies.find(s => s.name === value) || ditheringStrategies[0])}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select effect" />
          </SelectTrigger>
          <SelectContent>
            {ditheringStrategies.map((s) => (
              <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DitherControls config={strategy.config} values={config} onChange={handleConfigChange} />
      <div className="mt-4">
        <canvas ref={canvasRef} className="max-w-full h-auto border border-gray-300" />
      </div>
      <Button onClick={exportImage} className="mt-4">Export Dithered Image</Button>
    </div>
  );
};

export default ImageDithering;
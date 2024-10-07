"use client"
import React, { useState, useEffect, useRef } from 'react';
import { AtkinsonDithering } from '../strategies/AtkinsonDithering';
import { FloydSteinbergDithering } from '../strategies/FloydSteinbergDithering';
import { DitheringStrategy } from '../strategies/DitheringStrategy';

interface DitheringImageProps { }

const DitheringImage: React.FC<DitheringImageProps> = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [ditheredImage, setDitheredImage] = useState<string | null>(null);
    const [strategy, setStrategy] = useState<DitheringStrategy>(new AtkinsonDithering());
    const [intensity, setIntensity] = useState<number>(5);
    const [threshold, setThreshold] = useState<number>(128); // Extra config for Floyd-Steinberg

    const imageRef = useRef<HTMLImageElement | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid image file.');
        }
    };

    useEffect(() => {
        if (selectedImage && imageRef.current) {
            applyDithering();
        }
    }, [strategy, intensity, threshold, selectedImage]);

    const applyDithering = () => {
        if (selectedImage) {
            const ditheredDataUrl = strategy.applyDithering(selectedImage, { intensity, threshold });
            setDitheredImage(ditheredDataUrl);
        }
    };

    const downloadImage = () => {
        if (ditheredImage) {
            const link = document.createElement('a');
            link.href = ditheredImage;
            link.download = 'dithered-image.png';
            link.click();
        }
    };

    return (
        <div className="p-5 max-w-xl mx-auto">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
            {selectedImage && (
                <>
                    <div className="mb-4">
                        <label className="block mb-2">Dithering Algorithm:</label>
                        <select
                            value={strategy.constructor.name}
                            onChange={(e) => {
                                if (e.target.value === 'AtkinsonDithering') {
                                    setStrategy(new AtkinsonDithering());
                                } else if (e.target.value === 'FloydSteinbergDithering') {
                                    setStrategy(new FloydSteinbergDithering());
                                }
                            }}
                            className="mb-4 p-2 border border-gray-300 rounded"
                        >
                            <option value="AtkinsonDithering">Atkinson Dithering</option>
                            <option value="FloydSteinbergDithering">Floyd-Steinberg Dithering</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Intensity:</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {strategy instanceof FloydSteinbergDithering && (
                        <div className="mb-4">
                            <label className="block mb-2">Threshold:</label>
                            <input
                                type="range"
                                min="0"
                                max="255"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    )}

                    {selectedImage && (
                        <div className="mb-4">
                            <img ref={imageRef} src={selectedImage} alt="Original" className="max-w-full mb-4" />
                        </div>
                    )}

                    {ditheredImage && (
                        <div className="mb-4">
                            <img src={ditheredImage} alt="Dithered Preview" className="max-w-full mb-4" />
                        </div>
                    )}

                    <button
                        onClick={applyDithering}
                        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 mr-2"
                    >
                        Apply Dithering
                    </button>

                    <button
                        onClick={downloadImage}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Download Dithered Image
                    </button>
                </>
            )}
        </div>
    );
};

export default DitheringImage;

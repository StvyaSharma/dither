// components/DitherControls.tsx

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { DitherConfig } from '../types/dithering';

interface DitherControlsProps {
  config: DitherConfig;
  values: Record<string, number | boolean>;
  onChange: (name: string, value: number | boolean) => void;
}

const DitherControls: React.FC<DitherControlsProps> = ({ config, values, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {config.attributes.map((attr) => (
        <div key={attr.name}>
          <label className="block mb-2">{attr.name}</label>
          {attr.type === 'range' ? (
            <Slider
              min={attr.min}
              max={attr.max}
              step={attr.step}
              value={[values[attr.name] as number]}
              onValueChange={([value]) => onChange(attr.name, value)}
            />
          ) : (
            <Checkbox
              checked={values[attr.name] as boolean}
              onCheckedChange={(checked) => onChange(attr.name, checked)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default DitherControls;
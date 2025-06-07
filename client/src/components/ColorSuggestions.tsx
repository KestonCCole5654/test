import React, { useEffect, useState } from 'react';
import ColorThief from 'colorthief';

interface ColorSuggestionsProps {
  logoUrl: string;
  onColorSelect: (color: string) => void;
}

const ColorSuggestions: React.FC<ColorSuggestionsProps> = ({ logoUrl, onColorSelect }) => {
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const extractColors = async () => {
      if (!logoUrl) return;
      
      setIsLoading(true);
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, 3);
          
          const colors = palette.map(color => {
            const [r, g, b] = color;
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          });
          
          setSuggestedColors(colors);
        };
        
        img.src = logoUrl;
      } catch (error) {
        console.error('Error extracting colors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    extractColors();
  }, [logoUrl]);

  if (!logoUrl || suggestedColors.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-600 mb-2">Suggested colors from your logo:</p>
      <div className="flex gap-2">
        {suggestedColors.map((color, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onColorSelect(color)}
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={`Use ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSuggestions; 
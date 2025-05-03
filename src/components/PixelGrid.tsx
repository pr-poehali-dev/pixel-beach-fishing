
import { PropsWithChildren } from 'react';

interface PixelGridProps {
  width: number;
  height: number;
  pixelSize?: number;
  className?: string;
  style?: React.CSSProperties;
  showGrid?: boolean;
}

export default function PixelGrid({ 
  width, 
  height, 
  pixelSize = 32, // Увеличил значение по умолчанию до 32
  className = "", 
  style = {},
  showGrid = false,
  children 
}: PropsWithChildren<PixelGridProps>) {
  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: `${width * pixelSize}px`,
        height: `${height * pixelSize}px`,
        imageRendering: 'pixelated',
        ...style
      }}
    >
      {/* Сетка для визуализации пикселей (опционально) */}
      {showGrid && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {Array.from({ length: width }).map((_, x) => (
            <div 
              key={`grid-v-${x}`}
              className="absolute border-r border-black/5"
              style={{
                left: `${x * pixelSize}px`,
                top: 0,
                width: '1px',
                height: '100%'
              }}
            />
          ))}
          {Array.from({ length: height }).map((_, y) => (
            <div 
              key={`grid-h-${y}`}
              className="absolute border-b border-black/5"
              style={{
                top: `${y * pixelSize}px`,
                left: 0,
                width: '100%',
                height: '1px'
              }}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

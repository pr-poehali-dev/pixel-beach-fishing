
import { useState, useEffect } from 'react';

interface PlayerProps {
  position: { x: number, y: number };
  onMove: (x: number, y: number) => void;
  currentRod: string;
}

export default function Player({ position, onMove, currentRod }: PlayerProps) {
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
  const MOVEMENT_SPEED = 5;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newX = position.x;
      let newY = position.y;
      let newDirection = direction;
      
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          newX = Math.max(0, position.x - MOVEMENT_SPEED);
          newDirection = 'left';
          break;
        case 'ArrowRight':
        case 'KeyD':
          newX = Math.min(window.innerWidth - 40, position.x + MOVEMENT_SPEED);
          newDirection = 'right';
          break;
        case 'ArrowUp':
        case 'KeyW':
          newY = Math.max(window.innerHeight / 2, position.y - MOVEMENT_SPEED);
          break;
        case 'ArrowDown':
        case 'KeyS':
          newY = Math.min(window.innerHeight - 90, position.y + MOVEMENT_SPEED);
          break;
      }
      
      setDirection(newDirection);
      onMove(newX, newY);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onMove]);
  
  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scaleX(${direction === 'left' ? -1 : 1})`,
        zIndex: 10
      }}
    >
      {/* Пиксельный персонаж */}
      <div className="relative">
        {/* Голова */}
        <div className="w-8 h-8 bg-orange-300 rounded-t-lg"></div>
        
        {/* Тело */}
        <div className="w-8 h-12 bg-blue-500"></div>
        
        {/* Ноги */}
        <div className="absolute bottom-0 left-0 w-4 h-6 bg-gray-700"></div>
        <div className="absolute bottom-0 right-0 w-4 h-6 bg-gray-700"></div>
        
        {/* Удочка */}
        <div className="absolute top-8 right-0 w-16 h-2 bg-brown-500 rotate-45 origin-left">
          <div className="absolute top-0 right-0 w-1 h-6 bg-gray-400"></div>
          <div className="absolute top-6 right-0 w-2 h-2 rounded-full bg-red-500"></div>
        </div>
        
        {/* Информация об удочке */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/50 text-white px-2 rounded text-xs">
          {currentRod}
        </div>
      </div>
    </div>
  );
}

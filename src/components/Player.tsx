
import { useState, useEffect } from 'react';
import PixelGrid from './PixelGrid';

interface PlayerProps {
  position: { x: number, y: number };
  onMove: (x: number, y: number) => void;
  currentRod: string;
}

type PixelColor = string;
type SpriteData = PixelColor[][];

export default function Player({ position, onMove, currentRod }: PlayerProps) {
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  
  const PIXEL_SIZE = 16;
  const MOVEMENT_SPEED = 4;
  
  // Создаем пиксельный спрайт персонажа (голова)
  const headSprite: SpriteData = [
    ['', '', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '', ''],
    ['', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', ''],
    ['#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B'],
    ['#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B'],
    ['#FFD39B', '#FFD39B', '#000000', '#FFD39B', '#FFD39B', '#000000', '#FFD39B', '#FFD39B'],
    ['#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B'],
    ['', '#FFD39B', '#FFD39B', '#FF9090', '#FF9090', '#FFD39B', '#FFD39B', ''],
    ['', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', '#FFD39B', ''],
  ];
  
  // Тело персонажа
  const bodySprite: SpriteData = [
    ['', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', ''],
    ['#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1'],
    ['#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1'],
    ['#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1'],
    ['#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1'],
    ['#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1', '#4169E1'],
    ['', '#4169E1', '#4169E1', '', '', '#4169E1', '#4169E1', ''],
    ['', '#4169E1', '#4169E1', '', '', '#4169E1', '#4169E1', ''],
  ];
  
  // Ноги персонажа (кадр 1)
  const legsSprite1: SpriteData = [
    ['', '#333333', '#333333', '', '', '#333333', '#333333', ''],
    ['', '#333333', '#333333', '', '', '#333333', '#333333', ''],
    ['', '#333333', '#333333', '', '', '#333333', '#333333', ''],
    ['', '#333333', '#333333', '', '', '#333333', '#333333', ''],
  ];
  
  // Ноги персонажа (кадр 2 - ходьба)
  const legsSprite2: SpriteData = [
    ['#333333', '#333333', '', '', '', '', '#333333', '#333333'],
    ['#333333', '#333333', '', '', '', '', '#333333', '#333333'],
    ['', '#333333', '#333333', '', '', '#333333', '#333333', ''],
    ['', '', '#333333', '', '', '#333333', '', ''],
  ];
  
  // Удочка
  const rodSprite: SpriteData = [
    ['#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '#8B4513'],
    ['', '', '', '', '', '', '', '', '', '', '', '#8B4513'],
    ['', '', '', '', '', '', '', '', '', '', '', '#FF0000'],
  ];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newX = position.x;
      let newY = position.y;
      let newDirection = direction;
      let hasMovement = false;
      
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          newX = Math.max(0, position.x - MOVEMENT_SPEED * PIXEL_SIZE);
          newDirection = 'left';
          hasMovement = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          newX = Math.min(window.innerWidth - 8 * PIXEL_SIZE, position.x + MOVEMENT_SPEED * PIXEL_SIZE);
          newDirection = 'right';
          hasMovement = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
          newY = Math.max(window.innerHeight / 2, position.y - MOVEMENT_SPEED * PIXEL_SIZE);
          hasMovement = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          newY = Math.min(window.innerHeight - 16 * PIXEL_SIZE, position.y + MOVEMENT_SPEED * PIXEL_SIZE);
          hasMovement = true;
          break;
      }
      
      setDirection(newDirection);
      setIsWalking(hasMovement);
      onMove(newX, newY);
    };
    
    const handleKeyUp = () => {
      setIsWalking(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position, onMove, direction]);
  
  // Анимация ходьбы
  useEffect(() => {
    let animationInterval: number;
    
    if (isWalking) {
      animationInterval = window.setInterval(() => {
        setFrame(prev => (prev === 0 ? 1 : 0));
      }, 200);
    } else {
      setFrame(0);
    }
    
    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [isWalking]);
  
  // Функция отрисовки спрайта
  const renderPixelSprite = (sprite: SpriteData, offsetX = 0, offsetY = 0) => {
    return sprite.map((row, y) => 
      row.map((color, x) => 
        color ? (
          <div 
            key={`pixel-${x}-${y}-${Math.random()}`}
            className="absolute"
            style={{
              left: `${(x + offsetX) * PIXEL_SIZE}px`,
              top: `${(y + offsetY) * PIXEL_SIZE}px`,
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              backgroundColor: color
            }}
          />
        ) : null
      )
    );
  };
  
  return (
    <div
      className="absolute transition-transform duration-100 ease-linear"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scaleX(${direction === 'left' ? -1 : 1})`,
        transformOrigin: 'center',
        width: `${8 * PIXEL_SIZE}px`,
        height: `${16 * PIXEL_SIZE}px`,
        zIndex: 50
      }}
    >
      {/* Пиксельный персонаж */}
      <div className="relative w-full h-full">
        {/* Отрисовка головы */}
        {renderPixelSprite(headSprite, 0, 0)}
        
        {/* Отрисовка тела */}
        {renderPixelSprite(bodySprite, 0, 8)}
        
        {/* Отрисовка ног (анимация ходьбы) */}
        {renderPixelSprite(frame === 0 ? legsSprite1 : legsSprite2, 0, 16)}
        
        {/* Удочка */}
        <div className="absolute" style={{
          top: `${10 * PIXEL_SIZE}px`,
          left: `${7 * PIXEL_SIZE}px`,
          transform: 'rotate(45deg)',
          transformOrigin: 'top left',
          zIndex: 40
        }}>
          {renderPixelSprite(rodSprite, 0, 0)}
        </div>
      </div>
      
      {/* Информация об удочке */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white px-2 py-1 rounded text-xs mb-1">
        {currentRod}
      </div>
    </div>
  );
}

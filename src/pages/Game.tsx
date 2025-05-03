
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Player from '@/components/Player';
import Inventory from '@/components/Inventory';
import FishingSpot from '@/components/FishingSpot';
import PixelGrid from '@/components/PixelGrid';

type Fish = {
  id: number;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  icon: string;
  color: string;
};

export default function Game() {
  const [money, setMoney] = useState<number>(0);
  const [inventory, setInventory] = useState<Fish[]>([]);
  const [position, setPosition] = useState({ x: 400, y: 400 });
  const [isFishing, setIsFishing] = useState(false);
  const [fishingProgress, setFishingProgress] = useState(0);
  const [currentRod, setCurrentRod] = useState({
    name: 'Обычная удочка',
    multiplier: 1,
    price: 0,
  });
  
  const PIXEL_SIZE = 16;
  const GRID_WIDTH = 64;
  const GRID_HEIGHT = 36;
  
  const RIVER_START_X = Math.floor(GRID_WIDTH * 0.75);
  const SHOP_END_X = Math.floor(GRID_WIDTH * 0.25);

  const handleMovement = (newX: number, newY: number) => {
    setPosition({ x: newX, y: newY });
  };

  const startFishing = () => {
    if (isFishing) return;
    
    setIsFishing(true);
    setFishingProgress(0);
    
    // Случайное время ожидания между 5 и 15 секундами, скорректированное множителем удочки
    const baseWaitTime = Math.floor(Math.random() * 10000) + 5000;
    const adjustedWaitTime = baseWaitTime / currentRod.multiplier;
    
    const interval = setInterval(() => {
      setFishingProgress(prev => {
        const newProgress = prev + (100 / (adjustedWaitTime / 100));
        return Math.min(newProgress, 100);
      });
    }, 100);
    
    setTimeout(() => {
      const catchItem = getCatchItem(currentRod.multiplier);
      setInventory(prev => [...prev, catchItem]);
      setIsFishing(false);
      setFishingProgress(0);
      clearInterval(interval);
    }, adjustedWaitTime);
  };

  const getCatchItem = (multiplier: number): Fish => {
    // Расширенный пул возможных предметов с цветами
    const items: Fish[] = [
      { id: 1, name: 'Мусор', rarity: 'common', price: 1, icon: '🗑️', color: '#777777' },
      { id: 2, name: 'Карась', rarity: 'common', price: 10, icon: '🐟', color: '#FFA500' },
      { id: 3, name: 'Окунь', rarity: 'common', price: 15, icon: '🐟', color: '#90EE90' },
      { id: 4, name: 'Щука', rarity: 'uncommon', price: 30, icon: '🐠', color: '#32CD32' },
      { id: 5, name: 'Сом', rarity: 'uncommon', price: 50, icon: '🐠', color: '#4682B4' },
      { id: 6, name: 'Морской конёк', rarity: 'rare', price: 80, icon: '🐙', color: '#FFD700' },
      { id: 7, name: 'Морской ёж', rarity: 'rare', price: 100, icon: '🦔', color: '#9932CC' },
      { id: 8, name: 'Медуза', rarity: 'rare', price: 120, icon: '🧠', color: '#FF69B4' },
      { id: 9, name: 'Дельфин', rarity: 'epic', price: 200, icon: '🐬', color: '#00BFFF' },
      { id: 10, name: 'Акула', rarity: 'epic', price: 300, icon: '🦈', color: '#4169E1' },
      { id: 11, name: 'Кит', rarity: 'legendary', price: 500, icon: '🐋', color: '#0000CD' }
    ];
    
    // Вероятности для каждой редкости (с учетом множителя удочки)
    const rarityChances = {
      common: 0.6 - (multiplier * 0.05),
      uncommon: 0.25,
      rare: 0.1 + (multiplier * 0.02),
      epic: 0.04 + (multiplier * 0.02),
      legendary: 0.01 + (multiplier * 0.01)
    };
    
    // Генерируем случайное число для определения редкости
    const roll = Math.random();
    
    let selectedRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    let cumulativeChance = 0;
    
    for (const [rarity, chance] of Object.entries(rarityChances)) {
      cumulativeChance += chance;
      if (roll <= cumulativeChance) {
        selectedRarity = rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
        break;
      }
    }
    
    // Если не определилось (что маловероятно), устанавливаем common
    selectedRarity = selectedRarity || 'common';
    
    // Фильтруем предметы по выбранной редкости
    const rarityItems = items.filter(item => item.rarity === selectedRarity);
    
    // Выбираем случайный предмет из отфильтрованного списка
    return rarityItems[Math.floor(Math.random() * rarityItems.length)];
  };

  const sellFish = (fishId: number) => {
    const fishIndex = inventory.findIndex(fish => fish.id === fishId);
    if (fishIndex === -1) return;
    
    const fish = inventory[fishIndex];
    const newInventory = [...inventory];
    newInventory.splice(fishIndex, 1);
    
    setInventory(newInventory);
    setMoney(prev => prev + fish.price);
  };

  const buyRod = (rodName: string, price: number, multiplier: number) => {
    if (money < price) return;
    
    setMoney(prev => prev - price);
    setCurrentRod({ name: rodName, multiplier, price });
  };

  // Генерация пиксельного мира
  const renderWorld = () => {
    // Небо
    const skyTiles = [];
    for (let y = 0; y < GRID_HEIGHT / 2; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const blueTone = 180 + Math.floor((y / (GRID_HEIGHT / 2)) * 50);
        skyTiles.push(
          <div
            key={`sky-${x}-${y}`}
            className="absolute"
            style={{
              left: `${x * PIXEL_SIZE}px`,
              top: `${y * PIXEL_SIZE}px`,
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              backgroundColor: `rgb(100, 150, ${blueTone})`,
            }}
          />
        );
      }
    }
    
    // Солнце
    const sunSize = 4;
    const sunX = GRID_WIDTH - 10;
    const sunY = 5;
    
    for (let y = 0; y < sunSize; y++) {
      for (let x = 0; x < sunSize; x++) {
        const distance = Math.sqrt(Math.pow(x - sunSize/2, 2) + Math.pow(y - sunSize/2, 2));
        if (distance <= sunSize/2) {
          skyTiles.push(
            <div
              key={`sun-${x}-${y}`}
              className="absolute"
              style={{
                left: `${(sunX + x) * PIXEL_SIZE}px`,
                top: `${(sunY + y) * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: '#FFFF00',
              }}
            />
          );
        }
      }
    }
    
    // Песок
    const sandTiles = [];
    for (let y = GRID_HEIGHT / 2; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Река справа
        if (x >= RIVER_START_X) {
          const waveOffset = Math.sin(x * 0.3 + Date.now() * 0.001) * 2;
          const waterY = y + waveOffset;
          
          // Волны на воде
          const blueTone = 180 + Math.floor(Math.sin(x * 0.5 + y * 0.2 + Date.now() * 0.001) * 30);
          
          sandTiles.push(
            <div
              key={`water-${x}-${y}`}
              className="absolute"
              style={{
                left: `${x * PIXEL_SIZE}px`,
                top: `${waterY * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: `rgb(0, 120, ${blueTone})`,
              }}
            />
          );
        } 
        // Магазин слева
        else if (x <= SHOP_END_X) {
          // Деревянная текстура магазина
          const woodVariation = Math.sin(y * 0.5) * 20;
          const woodTone = 140 + Math.floor(woodVariation);
          
          sandTiles.push(
            <div
              key={`shop-${x}-${y}`}
              className="absolute"
              style={{
                left: `${x * PIXEL_SIZE}px`,
                top: `${y * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: `rgb(${woodTone}, ${woodTone-40}, 70)`,
              }}
            />
          );
        } 
        // Песок
        else {
          const sandVariation = Math.floor(Math.random() * 15);
          sandTiles.push(
            <div
              key={`sand-${x}-${y}`}
              className="absolute"
              style={{
                left: `${x * PIXEL_SIZE}px`,
                top: `${y * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: `rgb(240, ${215 + sandVariation}, ${180 + sandVariation})`,
              }}
            />
          );
        }
      }
    }
    
    return [...skyTiles, ...sandTiles];
  };
  
  // Рендеринг интерфейса магазина
  const renderShop = () => {
    const shopSign = [];
    const signX = 2;
    const signY = GRID_HEIGHT / 2 + 2;
    
    // Вывеска магазина
    shopSign.push(
      <div 
        key="shop-sign"
        className="absolute px-2 py-1 bg-amber-800 text-white text-sm rounded border-2 border-amber-900"
        style={{
          left: `${signX * PIXEL_SIZE}px`,
          top: `${signY * PIXEL_SIZE}px`,
          zIndex: 20
        }}
      >
        РЫБНЫЙ МАГАЗИН
      </div>
    );
    
    return shopSign;
  };
  
  // Проверка, находится ли игрок в зоне реки
  const isPlayerNearRiver = position.x > window.innerWidth * 0.7;
  
  // Проверка, находится ли игрок в зоне магазина
  const isPlayerNearShop = position.x < window.innerWidth * 0.3;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Пиксельный мир */}
      <PixelGrid 
        width={GRID_WIDTH} 
        height={GRID_HEIGHT} 
        pixelSize={PIXEL_SIZE} 
        className="mx-auto my-auto"
      >
        {renderWorld()}
        {renderShop()}
      </PixelGrid>
      
      {/* Игрок */}
      <Player position={position} onMove={handleMovement} currentRod={currentRod.name} />
      
      {/* Интерфейс рыбалки (появляется у реки) */}
      {isPlayerNearRiver && (
        <div className="absolute right-4 top-1/3 p-4 bg-blue-900/80 border-2 border-blue-700 rounded-lg text-white">
          <h3 className="font-pixel text-lg mb-2">Рыбалка</h3>
          
          {isFishing ? (
            <div className="space-y-2">
              <div className="animate-pulse text-center">Ловим рыбу...</div>
              <div className="w-full h-4 bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${fishingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button 
              onClick={startFishing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Закинуть удочку
            </Button>
          )}
          
          <div className="mt-2 text-xs text-blue-200">
            Текущая удочка: {currentRod.name} (x{currentRod.multiplier})
          </div>
        </div>
      )}
      
      {/* Интерфейс магазина (появляется у магазина) */}
      {isPlayerNearShop && (
        <div className="absolute left-4 top-1/4 p-4 bg-amber-900/80 border-2 border-amber-700 rounded-lg text-white max-w-xs">
          <h3 className="font-pixel text-lg mb-2">Магазин</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-amber-200 mb-2">Продать улов</h4>
              {inventory.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {inventory.map(fish => (
                    <div 
                      key={`${fish.id}-${Math.random()}`} 
                      className="flex justify-between items-center border-b border-amber-700 pb-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fish.icon}</span>
                        <span 
                          style={{ color: fish.color }}
                        >
                          {fish.name}
                        </span>
                      </div>
                      <Button 
                        onClick={() => sellFish(fish.id)}
                        className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500"
                      >
                        +{fish.price}¥
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-amber-400/60 text-sm">У вас нет улова</div>
              )}
            </div>
            
            <div>
              <h4 className="text-amber-200 mb-2">Улучшить удочку</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-pixel">Железная</span>
                    <span className="text-green-400 text-xs ml-2">x1.5</span>
                  </div>
                  <Button 
                    onClick={() => buyRod('Железная удочка', 100, 1.5)}
                    disabled={money < 100 || currentRod.multiplier >= 1.5}
                    className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                  >
                    100¥
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-pixel">Профессиональная</span>
                    <span className="text-green-400 text-xs ml-2">x2.0</span>
                  </div>
                  <Button 
                    onClick={() => buyRod('Профессиональная удочка', 250, 2)}
                    disabled={money < 250 || currentRod.multiplier >= 2}
                    className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                  >
                    250¥
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-pixel">Золотая</span>
                    <span className="text-green-400 text-xs ml-2">x3.0</span>
                  </div>
                  <Button 
                    onClick={() => buyRod('Золотая удочка', 500, 3)}
                    disabled={money < 500 || currentRod.multiplier >= 3}
                    className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                  >
                    500¥
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-pixel">Капитанская</span>
                    <span className="text-green-400 text-xs ml-2">x3.5</span>
                  </div>
                  <Button 
                    onClick={() => buyRod('Капитанская удочка', 1000, 3.5)}
                    disabled={money < 1000 || currentRod.multiplier >= 3.5}
                    className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                  >
                    1000¥
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Интерфейс статуса игрока */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs">¥</div>
          <span className="font-pixel">{money}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs">🎣</div>
          <span className="font-pixel">{currentRod.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">🐟</div>
          <span className="font-pixel">{inventory.length}</span>
        </div>
      </div>
      
      {/* Подсказки по управлению */}
      <div className="absolute bottom-4 right-4 p-2 bg-black/50 text-white text-xs rounded">
        <div>WASD / Стрелки - перемещение</div>
        <div>Подойди к реке справа, чтобы рыбачить</div>
        <div>Подойди к магазину слева, чтобы продать улов</div>
      </div>
    </div>
  );
}

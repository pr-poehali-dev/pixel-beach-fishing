
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

type Bird = {
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
};

export default function Game() {
  const [money, setMoney] = useState<number>(50); // Начальные деньги для возможности покупки
  const [inventory, setInventory] = useState<Fish[]>([]);
  const [position, setPosition] = useState({ x: 400, y: 400 });
  const [isFishing, setIsFishing] = useState(false);
  const [fishingProgress, setFishingProgress] = useState(0);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');
  const [shopOpened, setShopOpened] = useState(false);
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

  // Инициализируем птиц при загрузке игры
  useEffect(() => {
    const initialBirds: Bird[] = [];
    for (let i = 0; i < 5; i++) {
      initialBirds.push({
        x: Math.random() * GRID_WIDTH * PIXEL_SIZE,
        y: 50 + Math.random() * 100,
        speed: 0.5 + Math.random() * 1,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    setBirds(initialBirds);
    
    // Меняем время суток каждые 2 минуты
    const dayTimeInterval = setInterval(() => {
      setTimeOfDay(prevTime => {
        switch(prevTime) {
          case 'morning': return 'day';
          case 'day': return 'evening';
          case 'evening': return 'night';
          case 'night': return 'morning';
          default: return 'day';
        }
      });
    }, 120000);
    
    return () => clearInterval(dayTimeInterval);
  }, []);

  // Анимация птиц
  useEffect(() => {
    const birdAnimationInterval = setInterval(() => {
      setBirds(prevBirds => prevBirds.map(bird => {
        let newX = bird.x + bird.speed * bird.direction;
        let newDirection = bird.direction;
        
        // Если птица вылетает за пределы экрана, меняем направление
        if (newX > GRID_WIDTH * PIXEL_SIZE) {
          newDirection = -1;
          newX = GRID_WIDTH * PIXEL_SIZE;
        } else if (newX < 0) {
          newDirection = 1;
          newX = 0;
        }
        
        // Случайные вертикальные колебания
        const newY = bird.y + (Math.sin(Date.now() * 0.001 + bird.x * 0.1) * 2);
        
        return {
          ...bird,
          x: newX,
          y: newY,
          direction: newDirection
        };
      }));
    }, 50);
    
    return () => clearInterval(birdAnimationInterval);
  }, []);

  const handleMovement = (newX: number, newY: number) => {
    setPosition({ x: newX, y: newY });
  };

  const startFishing = () => {
    if (isFishing) return;
    
    setIsFishing(true);
    setFishingProgress(0);
    
    // Случайное время ожидания, скорректированное множителем удочки
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
    // Расширенный пул предметов с зависимостью от времени суток
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
      { id: 11, name: 'Кит', rarity: 'legendary', price: 500, icon: '🐋', color: '#0000CD' },
      // Ночные рыбы
      { id: 12, name: 'Светящаяся рыба', rarity: 'rare', price: 150, icon: '✨', color: '#E6E6FA' },
      { id: 13, name: 'Угорь', rarity: 'uncommon', price: 70, icon: '〰️', color: '#483D8B' },
      // Утренние рыбы
      { id: 14, name: 'Лосось', rarity: 'uncommon', price: 90, icon: '🐟', color: '#FA8072' },
      { id: 15, name: 'Форель', rarity: 'rare', price: 120, icon: '🐟', color: '#20B2AA' },
    ];
    
    // Фильтруем рыб по времени суток
    let timeFilteredItems = items;
    if (timeOfDay === 'night') {
      timeFilteredItems = items.filter(item => 
        item.id === 1 || // мусор всегда 
        item.id === 12 || 
        item.id === 13 || 
        item.rarity === 'epic' || 
        item.rarity === 'legendary'
      );
    } else if (timeOfDay === 'morning') {
      timeFilteredItems = items.filter(item => 
        item.id === 1 || 
        item.id === 14 || 
        item.id === 15 || 
        item.rarity === 'common'
      );
    }
    
    // Вероятности с учетом множителя удочки
    const rarityChances = {
      common: 0.6 - (multiplier * 0.05),
      uncommon: 0.25,
      rare: 0.1 + (multiplier * 0.02),
      epic: 0.04 + (multiplier * 0.02),
      legendary: 0.01 + (multiplier * 0.01)
    };
    
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
    
    selectedRarity = selectedRarity || 'common';
    
    // Фильтруем предметы по редкости
    const rarityItems = timeFilteredItems.filter(item => item.rarity === selectedRarity);
    
    // Если нет предметов выбранной редкости в это время суток, берем из общего списка
    if (rarityItems.length === 0) {
      const defaultItems = items.filter(item => item.rarity === selectedRarity);
      return defaultItems[Math.floor(Math.random() * defaultItems.length)];
    }
    
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

  const sellAllFish = () => {
    if (inventory.length === 0) return;
    
    const totalValue = inventory.reduce((sum, fish) => sum + fish.price, 0);
    setMoney(prev => prev + totalValue);
    setInventory([]);
  };

  const buyRod = (rodName: string, price: number, multiplier: number) => {
    if (money < price) return;
    
    setMoney(prev => prev - price);
    setCurrentRod({ name: rodName, multiplier, price });
    
    // Закрываем магазин после покупки
    setTimeout(() => setShopOpened(false), 1000);
  };

  // Определяем цвета в зависимости от времени суток
  const getSkyColor = () => {
    switch (timeOfDay) {
      case 'morning': return { from: '#FF7F50', to: '#87CEEB' };
      case 'day': return { from: '#87CEEB', to: '#1E90FF' };
      case 'evening': return { from: '#FF4500', to: '#4B0082' };
      case 'night': return { from: '#191970', to: '#000033' };
      default: return { from: '#87CEEB', to: '#1E90FF' };
    }
  };

  const getWaterColor = () => {
    switch (timeOfDay) {
      case 'morning': return { base: '#4682B4', ripple: '#6495ED' };
      case 'day': return { base: '#1E90FF', ripple: '#00BFFF' };
      case 'evening': return { base: '#4169E1', ripple: '#6495ED' };
      case 'night': return { base: '#191970', ripple: '#0000CD' };
      default: return { base: '#1E90FF', ripple: '#00BFFF' };
    }
  };

  // Рендеринг пиксельного мира
  const renderWorld = useCallback(() => {
    const skyColors = getSkyColor();
    const waterColors = getWaterColor();
    
    // Небо
    const skyTiles = [];
    for (let y = 0; y < GRID_HEIGHT / 2; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Градиент от верха к низу
        const ratio = y / (GRID_HEIGHT / 2);
        const color = interpolateColor(skyColors.from, skyColors.to, ratio);
        
        skyTiles.push(
          <div
            key={`sky-${x}-${y}`}
            className="absolute"
            style={{
              left: `${x * PIXEL_SIZE}px`,
              top: `${y * PIXEL_SIZE}px`,
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              backgroundColor: color,
            }}
          />
        );
      }
    }
    
    // Солнце или луна
    const celestialSize = 4;
    const celestialX = timeOfDay === 'night' ? 10 : GRID_WIDTH - 10;
    const celestialY = timeOfDay === 'night' ? 5 : 5;
    const celestialColor = timeOfDay === 'night' ? '#E6E6FA' : '#FFFF00';
    
    for (let y = 0; y < celestialSize; y++) {
      for (let x = 0; x < celestialSize; x++) {
        const distance = Math.sqrt(Math.pow(x - celestialSize/2, 2) + Math.pow(y - celestialSize/2, 2));
        if (distance <= celestialSize/2) {
          skyTiles.push(
            <div
              key={`celestial-${x}-${y}`}
              className="absolute"
              style={{
                left: `${(celestialX + x) * PIXEL_SIZE}px`,
                top: `${(celestialY + y) * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: celestialColor,
                boxShadow: timeOfDay === 'night' ? '0 0 10px 2px rgba(230, 230, 250, 0.7)' : '0 0 15px 5px rgba(255, 255, 0, 0.7)',
              }}
            />
          );
        }
      }
    }
    
    // Звезды ночью
    if (timeOfDay === 'night') {
      for (let i = 0; i < 30; i++) {
        const starX = Math.floor(Math.random() * GRID_WIDTH);
        const starY = Math.floor(Math.random() * (GRID_HEIGHT / 2));
        skyTiles.push(
          <div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${starX * PIXEL_SIZE}px`,
              top: `${starY * PIXEL_SIZE}px`,
              width: `${PIXEL_SIZE / 4}px`,
              height: `${PIXEL_SIZE / 4}px`,
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              opacity: 0.7 + Math.random() * 0.3,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
            }}
          />
        );
      }
    }
    
    // Облака
    const clouds = [];
    const cloudPositions = [
      {x: 5, y: 3, width: 8},
      {x: 20, y: 6, width: 6},
      {x: 35, y: 4, width: 10},
      {x: 50, y: 7, width: 7},
    ];
    
    cloudPositions.forEach((cloud, idx) => {
      const cloudOffsetX = Math.sin(Date.now() * 0.0001 + idx) * 2;
      
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < cloud.width; x++) {
          const distance = Math.sqrt(Math.pow(x - cloud.width/2, 2) + Math.pow(y - 1, 2));
          if (distance <= cloud.width/2) {
            const opacity = timeOfDay === 'night' ? 0.3 : 0.8;
            clouds.push(
              <div
                key={`cloud-${idx}-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${(cloud.x + x + cloudOffsetX) * PIXEL_SIZE}px`,
                  top: `${(cloud.y + y) * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: timeOfDay === 'night' ? '#555555' : '#FFFFFF',
                  opacity: opacity - (distance / cloud.width) * 0.3,
                }}
              />
            );
          }
        }
      }
    });
    
    // Земля, песок и вода
    const groundTiles = [];
    for (let y = GRID_HEIGHT / 2; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Река справа
        if (x >= RIVER_START_X) {
          const waveOffset = Math.sin(x * 0.3 + Date.now() * 0.001) * 1.5;
          const rippleEffect = Math.sin(x * 0.5 + y * 0.2 + Date.now() * 0.002) * 0.7;
          
          // Генерируем волны на воде
          const waterBaseColor = waterColors.base;
          const waterRippleColor = waterColors.ripple;
          
          // Смешиваем цвета для эффекта ряби
          const waterColor = rippleEffect > 0 ? waterRippleColor : waterBaseColor;
          
          groundTiles.push(
            <div
              key={`water-${x}-${y}`}
              className="absolute"
              style={{
                left: `${x * PIXEL_SIZE}px`,
                top: `${(y + waveOffset) * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: waterColor,
                opacity: 0.8 + rippleEffect * 0.2,
              }}
            />
          );
          
          // Добавим белые гребни волн на поверхности
          if (y === Math.floor(GRID_HEIGHT / 2) && Math.random() > 0.7) {
            groundTiles.push(
              <div
                key={`foam-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * PIXEL_SIZE}px`,
                  top: `${(y + waveOffset) * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE / 3}px`,
                  backgroundColor: '#FFFFFF',
                  opacity: 0.5,
                }}
              />
            );
          }
        } 
        // Магазин слева
        else if (x <= SHOP_END_X) {
          // Строим магазин
          if (y >= GRID_HEIGHT / 2 && y < GRID_HEIGHT - 10) {
            // Стены магазина
            const wallColor = '#8B4513';
            
            // Окна и дверь
            if (y === GRID_HEIGHT / 2 + 5 && x > 2 && x < 6) {
              groundTiles.push(
                <div
                  key={`window-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: timeOfDay === 'night' ? '#FFFF99' : '#87CEEB',
                    boxShadow: timeOfDay === 'night' ? 'inset 0 0 5px rgba(255, 255, 153, 0.8)' : 'none',
                  }}
                />
              );
            } 
            // Дверь
            else if (y >= GRID_HEIGHT / 2 + 8 && y < GRID_HEIGHT / 2 + 14 && x > 10 && x < 14) {
              groundTiles.push(
                <div
                  key={`door-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: '#8B0000',
                  }}
                />
              );
              // Дверная ручка
              if (y === GRID_HEIGHT / 2 + 11 && x === 12) {
                groundTiles.push(
                  <div
                    key={`doorknob-${x}-${y}`}
                    className="absolute"
                    style={{
                      left: `${(x + 0.5) * PIXEL_SIZE}px`,
                      top: `${(y + 0.3) * PIXEL_SIZE}px`,
                      width: `${PIXEL_SIZE / 4}px`,
                      height: `${PIXEL_SIZE / 4}px`,
                      backgroundColor: '#FFD700',
                      borderRadius: '50%',
                    }}
                  />
                );
              }
            } else {
              // Обычные стены
              groundTiles.push(
                <div
                  key={`shop-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: wallColor,
                  }}
                />
              );
            }
          } 
          // Крыша магазина
          else if (y < GRID_HEIGHT / 2) {
            const roofColor = '#A52A2A';
            const roofY = GRID_HEIGHT / 2 - 1;
            const distFromCenter = Math.abs(x - SHOP_END_X / 2);
            
            if (y >= roofY - (SHOP_END_X / 4 - distFromCenter / 2) && y <= roofY) {
              groundTiles.push(
                <div
                  key={`roof-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: roofColor,
                  }}
                />
              );
            }
          }
          // Фундамент и земля
          else {
            const grassColor = timeOfDay === 'night' ? '#006400' : '#32CD32';
            groundTiles.push(
              <div
                key={`foundation-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * PIXEL_SIZE}px`,
                  top: `${y * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: grassColor,
                }}
              />
            );
          }
        } 
        // Песок и трава между зданием и рекой
        else {
          // Переход от травы к песку
          const distFromShop = x - SHOP_END_X;
          const distFromRiver = RIVER_START_X - x;
          const isCloserToShop = distFromShop < distFromRiver;
          
          // Трава возле магазина
          if (isCloserToShop && distFromShop < 8) {
            const grassColor = timeOfDay === 'night' ? '#006400' : '#32CD32';
            
            groundTiles.push(
              <div
                key={`grass-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * PIXEL_SIZE}px`,
                  top: `${y * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: grassColor,
                }}
              />
            );
            
            // Случайные травинки
            if (Math.random() > 0.8) {
              groundTiles.push(
                <div
                  key={`grass-detail-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${(y - 0.5) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE / 2}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: timeOfDay === 'night' ? '#008000' : '#7CFC00',
                  }}
                />
              );
            }
          } 
          // Песок ближе к реке
          else {
            const sandVariation = Math.floor(Math.random() * 15);
            const sandColor = timeOfDay === 'night' 
              ? `rgb(180, ${155 + sandVariation}, ${120 + sandVariation})`
              : `rgb(240, ${215 + sandVariation}, ${180 + sandVariation})`;
            
            groundTiles.push(
              <div
                key={`sand-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * PIXEL_SIZE}px`,
                  top: `${y * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: sandColor,
                }}
              />
            );
            
            // Случайные камешки на песке
            if (Math.random() > 0.95) {
              groundTiles.push(
                <div
                  key={`pebble-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${(x + 0.3) * PIXEL_SIZE}px`,
                    top: `${(y + 0.3) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE / 3}px`,
                    height: `${PIXEL_SIZE / 3}px`,
                    backgroundColor: '#808080',
                    borderRadius: '50%',
                  }}
                />
              );
            }
          }
        }
      }
    }
    
    return [...skyTiles, ...clouds, ...groundTiles];
  }, [timeOfDay, GRID_HEIGHT, GRID_WIDTH, PIXEL_SIZE, RIVER_START_X, SHOP_END_X]);
  
  // Вспомогательная функция для интерполяции цветов
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    const parseColor = (color: string) => {
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
      }
      return [0, 0, 0];
    };
    
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    
    const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Рендеринг птиц
  const renderBirds = () => {
    return birds.map((bird, index) => {
      // Пиксельная птица
      const birdColors = timeOfDay === 'night' ? ['#708090', '#A9A9A9'] : ['#000000', '#555555'];
      
      return (
        <div 
          key={`bird-${index}`}
          className="absolute"
          style={{
            left: `${bird.x}px`,
            top: `${bird.y}px`,
            transform: `scaleX(${bird.direction})`,
            zIndex: 20
          }}
        >
          {/* Тело птицы */}
          <div className="relative" style={{ width: `${PIXEL_SIZE * 2}px`, height: `${PIXEL_SIZE}px` }}>
            <div 
              className="absolute" 
              style={{ 
                width: `${PIXEL_SIZE}px`, 
                height: `${PIXEL_SIZE / 2}px`, 
                backgroundColor: birdColors[0],
                left: 0,
                top: 0
              }}
            />
            <div 
              className="absolute" 
              style={{ 
                width: `${PIXEL_SIZE / 2}px`, 
                height: `${PIXEL_SIZE / 2}px`, 
                backgroundColor: birdColors[1],
                left: PIXEL_SIZE, 
                top: 0,
                borderTopRightRadius: '50%'
              }}
            />
            
            {/* Крылья (анимированные) */}
            <div 
              className="absolute" 
              style={{ 
                width: `${PIXEL_SIZE}px`, 
                height: `${PIXEL_SIZE / 3}px`, 
                backgroundColor: birdColors[1],
                left: PIXEL_SIZE / 2,
                top: PIXEL_SIZE / 4,
                transform: `rotate(${Math.sin(Date.now() * 0.01 + index) * 30}deg)`,
                transformOrigin: 'center left'
              }}
            />
          </div>
        </div>
      );
    });
  };
  
  // Проверка, находится ли игрок в зоне реки
  const isPlayerNearRiver = position.x > window.innerWidth * 0.7;
  
  // Проверка, находится ли игрок в зоне магазина
  const isPlayerNearShop = position.x < window.innerWidth * 0.3;
  
  // Открытие/закрытие магазина
  const toggleShop = () => {
    if (isPlayerNearShop) {
      setShopOpened(!shopOpened);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Индикатор времени суток */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 px-3 py-1 rounded-full text-white text-xs">
        {timeOfDay === 'morning' && '🌅 Утро'}
        {timeOfDay === 'day' && '☀️ День'}
        {timeOfDay === 'evening' && '🌇 Вечер'}
        {timeOfDay === 'night' && '🌙 Ночь'}
      </div>
      
      {/* Пиксельный мир */}
      <PixelGrid 
        width={GRID_WIDTH} 
        height={GRID_HEIGHT} 
        pixelSize={PIXEL_SIZE} 
        className="mx-auto my-auto"
      >
        {renderWorld()}
        {renderBirds()}
        
        {/* Вывеска магазина */}
        <div 
          className={`absolute px-2 py-1 ${timeOfDay === 'night' ? 'bg-yellow-800/80' : 'bg-amber-800/80'} text-white text-xs rounded-md border border-amber-900 z-30`}
          style={{
            left: `${5 * PIXEL_SIZE}px`,
            top: `${(GRID_HEIGHT / 2 - 3) * PIXEL_SIZE}px`,
          }}
        >
          РЫБНЫЙ МАГАЗИН
        </div>
        
        {/* Подсветка входа в магазин */}
        {isPlayerNearShop && (
          <div 
            className="absolute text-white text-xs bg-white/20 px-2 py-1 rounded-md z-30 animate-pulse"
            style={{
              left: `${12 * PIXEL_SIZE}px`,
              top: `${(GRID_HEIGHT / 2 + 7) * PIXEL_SIZE}px`,
            }}
          >
            Нажмите E для входа
          </div>
        )}
      </PixelGrid>
      
      {/* Игрок */}
      <Player position={position} onMove={handleMovement} currentRod={currentRod.name} />
      
      {/* Интерфейс рыбалки (появляется у реки) */}
      {isPlayerNearRiver && (
        <div className="absolute right-4 top-1/3 p-4 bg-blue-900/80 border-2 border-blue-700 rounded-lg text-white max-w-xs z-40">
          <h3 className="text-lg mb-2 border-b pb-1 border-blue-600">Рыбалка</h3>
          
          {isFishing ? (
            <div className="space-y-2">
              <div className="animate-pulse text-center">Ловим рыбу...</div>
              <Progress value={fishingProgress} className="h-4" />
              <div className="text-xs text-center">
                Шанс на редкую рыбу: +{((currentRod.multiplier - 1) * 100).toFixed(0)}%
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={startFishing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Закинуть удочку
              </Button>
              
              <div className="text-xs">
                <p>Время суток влияет на улов!</p>
                <p>Ночью: больше редких и светящихся рыб</p>
                <p>Утром: больше лосося и форели</p>
                <p>Днем и вечером: разнообразный улов</p>
              </div>
            </div>
          )}
          
          <div className="mt-2 text-xs">
            <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
              <span>Удочка:</span>
              <span className="font-bold">{currentRod.name} (x{currentRod.multiplier})</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Интерфейс магазина (появляется при взаимодействии) */}
      {shopOpened && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-amber-900 border-4 border-amber-800 rounded-lg p-5 max-w-md w-full relative">
            <Button 
              onClick={() => setShopOpened(false)}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
            >
              ✕
            </Button>
            
            <h2 className="text-xl text-amber-200 mb-4 text-center">Рыбный Магазин</h2>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-amber-950/50 p-3 rounded-md">
                <h3 className="text-amber-200 border-b border-amber-700 pb-1 mb-2">Ваш улов</h3>
                
                {inventory.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {inventory.map(fish => (
                      <div 
                        key={`${fish.id}-${Math.random()}`} 
                        className="flex justify-between items-center border-b border-amber-800/50 pb-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{fish.icon}</span>
                          <span 
                            style={{ color: fish.color }}
                            className="text-sm"
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
                    
                    <div className="flex justify-between pt-1">
                      <span className="text-amber-200">Всего: {inventory.reduce((sum, fish) => sum + fish.price, 0)}¥</span>
                      <Button 
                        onClick={sellAllFish}
                        className="text-xs px-2 py-0 h-6 bg-green-600 hover:bg-green-500"
                      >
                        Продать всё
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-400/60 text-sm text-center p-2">Инвентарь пуст</div>
                )}
              </div>
              
              <div className="bg-amber-950/50 p-3 rounded-md">
                <h3 className="text-amber-200 border-b border-amber-700 pb-1 mb-2">Удочки</h3>
                
                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between items-center p-1 rounded ${currentRod.multiplier === 1 ? 'bg-amber-800/30' : ''}`}>
                    <div>
                      <span className="text-white">Обычная</span>
                      <span className="text-green-400 text-xs ml-2">x1.0</span>
                      <div className="text-amber-400/70 text-xs">Базовая модель</div>
                    </div>
                    <div className="text-amber-200 text-xs">
                      {currentRod.multiplier === 1 ? 'Используется' : 'Стартовая'}
                    </div>
                  </div>
                  
                  <div className={`flex justify-between items-center p-1 rounded ${currentRod.multiplier === 1.5 ? 'bg-amber-800/30' : ''}`}>
                    <div>
                      <span className="text-white">Железная</span>
                      <span className="text-green-400 text-xs ml-2">x1.5</span>
                      <div className="text-amber-400/70 text-xs">+15% к редким рыбам</div>
                    </div>
                    {currentRod.multiplier >= 1.5 ? (
                      <div className="text-amber-200 text-xs">
                        {currentRod.multiplier === 1.5 ? 'Используется' : 'Приобретено'}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => buyRod('Железная удочка', 100, 1.5)}
                        disabled={money < 100}
                        className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                      >
                        100¥
                      </Button>
                    )}
                  </div>
                  
                  <div className={`flex justify-between items-center p-1 rounded ${currentRod.multiplier === 2 ? 'bg-amber-800/30' : ''}`}>
                    <div>
                      <span className="text-white">Профессиональная</span>
                      <span className="text-green-400 text-xs ml-2">x2.0</span>
                      <div className="text-amber-400/70 text-xs">+30% к редким рыбам</div>
                    </div>
                    {currentRod.multiplier >= 2 ? (
                      <div className="text-amber-200 text-xs">
                        {currentRod.multiplier === 2 ? 'Используется' : 'Приобретено'}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => buyRod('Профессиональная удочка', 250, 2)}
                        disabled={money < 250}
                        className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                      >
                        250¥
                      </Button>
                    )}
                  </div>
                  
                  <div className={`flex justify-between items-center p-1 rounded ${currentRod.multiplier === 3 ? 'bg-amber-800/30' : ''}`}>
                    <div>
                      <span className="text-white">Золотая</span>
                      <span className="text-green-400 text-xs ml-2">x3.0</span>
                      <div className="text-amber-400/70 text-xs">+50% к редким рыбам</div>
                    </div>
                    {currentRod.multiplier >= 3 ? (
                      <div className="text-amber-200 text-xs">
                        {currentRod.multiplier === 3 ? 'Используется' : 'Приобретено'}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => buyRod('Золотая удочка', 500, 3)}
                        disabled={money < 500}
                        className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                      >
                        500¥
                      </Button>
                    )}
                  </div>
                  
                  <div className={`flex justify-between items-center p-1 rounded ${currentRod.multiplier === 3.5 ? 'bg-amber-800/30' : ''}`}>
                    <div>
                      <span className="text-white">Капитанская</span>
                      <span className="text-green-400 text-xs ml-2">x3.5</span>
                      <div className="text-amber-400/70 text-xs">+70% к редким рыбам</div>
                    </div>
                    {currentRod.multiplier >= 3.5 ? (
                      <div className="text-amber-200 text-xs">
                        Используется
                      </div>
                    ) : (
                      <Button 
                        onClick={() => buyRod('Капитанская удочка', 1000, 3.5)}
                        disabled={money < 1000}
                        className="text-xs px-2 py-0 h-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
                      >
                        1000¥
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4 pt-2 border-t border-amber-700">
              <div className="text-amber-200">
                Ваши деньги: <span className="font-bold">{money}¥</span>
              </div>
              <Button 
                onClick={() => setShopOpened(false)}
                className="bg-amber-700 hover:bg-amber-600"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Интерфейс статуса игрока */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white flex gap-4 items-center z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs">¥</div>
          <span className="font-medium">{money}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs">🎣</div>
          <span className="font-medium">x{currentRod.multiplier.toFixed(1)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">🐟</div>
          <span className="font-medium">{inventory.length}</span>
        </div>
      </div>
      
      {/* Инструкции */}
      <div className="absolute bottom-4 right-4 p-2 bg-black/70 text-white text-xs rounded-md z-40">
        <div><strong>WASD / Стрелки</strong> - перемещение</div>
        <div><strong>E</strong> - войти в магазин (когда рядом)</div>
        <div>Рыбалка справа, магазин слева</div>
        <div>Время суток влияет на улов!</div>
      </div>
    </div>
  );
}

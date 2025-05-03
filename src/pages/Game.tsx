
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Player from '@/components/Player';
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
  size: number;
};

type Cloud = {
  x: number;
  y: number;
  width: number;
  opacity: number;
  speed: number;
};

export default function Game() {
  const [money, setMoney] = useState<number>(50);
  const [inventory, setInventory] = useState<Fish[]>([]);
  const [position, setPosition] = useState({ x: 400, y: 400 });
  const [isFishing, setIsFishing] = useState(false);
  const [fishingProgress, setFishingProgress] = useState(0);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');
  const [shopOpened, setShopOpened] = useState(false);
  const [currentRod, setCurrentRod] = useState({
    name: 'Обычная удочка',
    multiplier: 1,
    price: 0,
  });
  
  const PIXEL_SIZE = 32; // Увеличен размер пикселя
  const GRID_WIDTH = 32; // Уменьшено количество блоков для сохранения размера экрана
  const GRID_HEIGHT = 18;
  
  const RIVER_START_X = Math.floor(GRID_WIDTH * 0.75);
  const SHOP_END_X = Math.floor(GRID_WIDTH * 0.25);

  // Инициализируем птиц и облака при загрузке игры
  useEffect(() => {
    // Птицы
    const initialBirds: Bird[] = [];
    for (let i = 0; i < 6; i++) {
      initialBirds.push({
        x: Math.random() * GRID_WIDTH * PIXEL_SIZE,
        y: 50 + Math.random() * 100,
        speed: 0.5 + Math.random() * 1.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        size: 0.8 + Math.random() * 0.5 // Разные размеры птиц
      });
    }
    setBirds(initialBirds);
    
    // Облака
    const initialClouds: Cloud[] = [];
    for (let i = 0; i < 4; i++) {
      initialClouds.push({
        x: Math.random() * GRID_WIDTH * PIXEL_SIZE,
        y: 20 + Math.random() * 60,
        width: 3 + Math.random() * 5,
        opacity: 0.6 + Math.random() * 0.3,
        speed: 0.1 + Math.random() * 0.3
      });
    }
    setClouds(initialClouds);
    
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
  }, [GRID_WIDTH, PIXEL_SIZE]);

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
        
        // Случайные вертикальные колебания для реалистичного полета
        const newY = bird.y + (Math.sin(Date.now() * 0.001 + bird.x * 0.1) * 2);
        
        return {
          ...bird,
          x: newX,
          y: newY,
          direction: newDirection
        };
      }));
    }, 33); // Более плавная анимация - 30fps
    
    return () => clearInterval(birdAnimationInterval);
  }, [GRID_WIDTH, PIXEL_SIZE]);

  // Анимация облаков
  useEffect(() => {
    const cloudAnimationInterval = setInterval(() => {
      setClouds(prevClouds => prevClouds.map(cloud => {
        let newX = cloud.x + cloud.speed;
        
        // Если облако выходит за пределы экрана, возвращаем его в начало
        if (newX > GRID_WIDTH * PIXEL_SIZE + cloud.width * PIXEL_SIZE) {
          newX = -cloud.width * PIXEL_SIZE;
        }
        
        return {
          ...cloud,
          x: newX
        };
      }));
    }, 50);
    
    return () => clearInterval(cloudAnimationInterval);
  }, [GRID_WIDTH, PIXEL_SIZE]);

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
      { id: 12, name: 'Светящаяся рыба', rarity: 'rare', price: 150, icon: '✨', color: '#E6E6FA' },
      { id: 13, name: 'Угорь', rarity: 'uncommon', price: 70, icon: '〰️', color: '#483D8B' },
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

  // Определяем цвета в зависимости от времени суток с более реалистичными оттенками
  const getSkyColors = useMemo(() => {
    switch (timeOfDay) {
      case 'morning': return { 
        top: '#FF7F50', 
        middle: '#FFB6C1', 
        bottom: '#87CEEB',
        hasSun: true,
        sunColor: '#FFA07A',
        sunGlow: '0 0 20px 10px rgba(255, 160, 122, 0.8)'
      };
      case 'day': return { 
        top: '#1E90FF', 
        middle: '#4682B4', 
        bottom: '#87CEEB',
        hasSun: true,
        sunColor: '#FFFF00',
        sunGlow: '0 0 25px 15px rgba(255, 255, 0, 0.7)'
      };
      case 'evening': return { 
        top: '#191970', 
        middle: '#8A2BE2', 
        bottom: '#FF4500',
        hasSun: true,
        sunColor: '#FF6347',
        sunGlow: '0 0 20px 10px rgba(255, 99, 71, 0.8)'
      };
      case 'night': return { 
        top: '#000033', 
        middle: '#191970', 
        bottom: '#483D8B',
        hasSun: false,
        sunColor: '#E6E6FA',
        sunGlow: '0 0 15px 5px rgba(230, 230, 250, 0.7)'
      };
      default: return { 
        top: '#1E90FF', 
        middle: '#4682B4', 
        bottom: '#87CEEB',
        hasSun: true,
        sunColor: '#FFFF00',
        sunGlow: '0 0 25px 15px rgba(255, 255, 0, 0.7)'
      };
    }
  }, [timeOfDay]);

  // Параметры воды с учетом времени суток
  const getWaterColors = useMemo(() => {
    switch (timeOfDay) {
      case 'morning': return { 
        base: '#4682B4', 
        ripple: '#6495ED',
        highlight: '#B0E0E6',
        opacity: 0.85
      };
      case 'day': return { 
        base: '#1E90FF', 
        ripple: '#00BFFF',
        highlight: '#87CEFA',
        opacity: 0.9
      };
      case 'evening': return { 
        base: '#4169E1', 
        ripple: '#6495ED',
        highlight: '#1E90FF',
        opacity: 0.8
      };
      case 'night': return { 
        base: '#191970', 
        ripple: '#0000CD',
        highlight: '#0000FF',
        opacity: 0.75
      };
      default: return { 
        base: '#1E90FF', 
        ripple: '#00BFFF',
        highlight: '#87CEFA',
        opacity: 0.9
      };
    }
  }, [timeOfDay]);

  // Рендеринг пиксельного мира с улучшенной графикой
  const renderWorld = useCallback(() => {
    const skyColors = getSkyColors;
    const waterColors = getWaterColors;
    
    // Небо с градиентом из трех цветов для реалистичности
    const skyTiles = [];
    for (let y = 0; y < GRID_HEIGHT / 2; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Определяем позицию в градиенте
        const ratio = y / (GRID_HEIGHT / 2);
        let color;
        
        if (ratio < 0.33) {
          // Верхняя треть неба
          const localRatio = ratio / 0.33;
          color = interpolateColor(skyColors.top, skyColors.middle, localRatio);
        } else if (ratio < 0.66) {
          // Средняя треть неба
          const localRatio = (ratio - 0.33) / 0.33;
          color = interpolateColor(skyColors.middle, skyColors.bottom, localRatio);
        } else {
          // Нижняя треть неба
          color = skyColors.bottom;
        }
        
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
              transition: 'background-color 2s ease-in-out',
            }}
          />
        );
      }
    }
    
    // Солнце или луна с сиянием
    const celestialSize = 2;
    const celestialX = timeOfDay === 'night' ? 3 : (timeOfDay === 'evening' ? 5 : GRID_WIDTH - 5);
    const celestialY = timeOfDay === 'night' ? 3 : (timeOfDay === 'evening' ? 2 : 3);
    
    // Эффект сияния через несколько слоев прозрачности
    for (let radius = 3; radius > 0; radius--) {
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          const distance = Math.sqrt(x*x + y*y);
          if (distance <= radius && distance > radius - 1) {
            skyTiles.push(
              <div
                key={`celestial-glow-${x}-${y}-${radius}`}
                className="absolute rounded-full"
                style={{
                  left: `${(celestialX + x) * PIXEL_SIZE}px`,
                  top: `${(celestialY + y) * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: skyColors.sunColor,
                  opacity: (1 - distance / 3) * 0.3,
                }}
              />
            );
          }
        }
      }
    }
    
    // Само небесное тело (солнце или луна)
    for (let y = 0; y < celestialSize; y++) {
      for (let x = 0; x < celestialSize; x++) {
        skyTiles.push(
          <div
            key={`celestial-${x}-${y}`}
            className="absolute rounded-full"
            style={{
              left: `${(celestialX + x/2) * PIXEL_SIZE}px`,
              top: `${(celestialY + y/2) * PIXEL_SIZE}px`,
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              backgroundColor: skyColors.sunColor,
              boxShadow: skyColors.sunGlow,
            }}
          />
        );
      }
    }
    
    // Звезды ночью с мерцанием
    if (timeOfDay === 'night') {
      for (let i = 0; i < 40; i++) {
        const starX = Math.floor(Math.random() * GRID_WIDTH);
        const starY = Math.floor(Math.random() * (GRID_HEIGHT / 2));
        const starSize = 0.1 + Math.random() * 0.3; // Разные размеры звезд
        const blinkDelay = 3 + Math.random() * 5; // Разное время мерцания
        const brightness = 0.5 + Math.random() * 0.5;
        
        skyTiles.push(
          <div
            key={`star-${i}-${starX}-${starY}`}
            className="absolute rounded-full"
            style={{
              left: `${(starX + 0.5 - starSize/2) * PIXEL_SIZE}px`,
              top: `${(starY + 0.5 - starSize/2) * PIXEL_SIZE}px`,
              width: `${starSize * PIXEL_SIZE}px`,
              height: `${starSize * PIXEL_SIZE}px`,
              backgroundColor: '#FFFFFF',
              opacity: brightness,
              boxShadow: '0 0 2px 1px rgba(255, 255, 255, 0.5)',
              animation: `twinkle ${blinkDelay}s ease-in-out infinite alternate`,
            }}
          />
        );
      }
    }
    
    // Земля, песок и вода с улучшенными деталями
    const groundTiles = [];
    for (let y = GRID_HEIGHT / 2; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Река справа с реалистичными волнами и отражениями
        if (x >= RIVER_START_X) {
          const distFromShore = x - RIVER_START_X;
          const depthFactor = Math.min(distFromShore / 3, 1); // Эффект глубины воды
          
          // Более сложный паттерн волн с разной амплитудой и частотой
          const waveOffset = Math.sin(x * 0.3 + Date.now() * 0.001) * 1.5 * depthFactor;
          const rippleEffect = Math.sin(x * 0.5 + y * 0.2 + Date.now() * 0.002) * 0.7;
          
          // Смешиваем цвета с учетом глубины и ряби
          const waterDepthColor = interpolateColor(waterColors.base, darkShade(waterColors.base), depthFactor);
          const waterColor = rippleEffect > 0 ? 
            interpolateColor(waterDepthColor, waterColors.ripple, Math.abs(rippleEffect)) : 
            waterDepthColor;
          
          // Основной блок воды
          groundTiles.push(
            <div
              key={`water-${x}-${y}`}
              className="absolute"
              style={{
                left: `${x * PIXEL_SIZE}px`,
                top: `${(y + waveOffset * 0.1) * PIXEL_SIZE}px`,
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: waterColor,
                opacity: waterColors.opacity + (rippleEffect > 0 ? 0.1 : 0),
                boxShadow: rippleEffect > 0.5 ? 'inset 0 1px 3px rgba(255, 255, 255, 0.3)' : 'none',
              }}
            />
          );
          
          // Добавим блики на поверхности воды (только на поверхности)
          if (y === Math.floor(GRID_HEIGHT / 2) && Math.random() > 0.85 && timeOfDay !== 'night') {
            groundTiles.push(
              <div
                key={`water-highlight-${x}-${y}`}
                className="absolute rounded-full"
                style={{
                  left: `${(x + 0.25 + Math.random() * 0.5) * PIXEL_SIZE}px`,
                  top: `${(y + waveOffset * 0.1 + 0.25) * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE * 0.5}px`,
                  height: `${PIXEL_SIZE * 0.15}px`,
                  backgroundColor: waterColors.highlight,
                  opacity: 0.5 + Math.random() * 0.3,
                  transform: `rotate(${Math.random() * 180}deg)`,
                }}
              />
            );
          }
          
          // Эффект ряби у берега
          if (x === RIVER_START_X && Math.random() > 0.5) {
            groundTiles.push(
              <div
                key={`shore-foam-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${(x - 0.1) * PIXEL_SIZE}px`,
                  top: `${(y + waveOffset * 0.1) * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE * 0.2}px`,
                  height: `${PIXEL_SIZE * 0.4}px`,
                  backgroundColor: '#FFFFFF',
                  opacity: 0.6 + Math.random() * 0.2,
                  borderRadius: '50%',
                }}
              />
            );
          }
        } 
        // Магазин слева с детализированным зданием
        else if (x <= SHOP_END_X) {
          // Здание магазина с окнами, дверями и деталями
          if (y >= GRID_HEIGHT / 2 && y < GRID_HEIGHT - 5) {
            // Стены магазина с текстурой дерева
            const wallBaseColor = '#8B4513';
            const woodGrain = Math.sin(y * 2.5) * 15;
            const wallColor = adjustColorBrightness(wallBaseColor, woodGrain);
            
            // Окна
            if ((y === GRID_HEIGHT / 2 + 3 || y === GRID_HEIGHT / 2 + 4) && 
                (x === SHOP_END_X - 3 || x === SHOP_END_X - 4)) {
              const windowColor = timeOfDay === 'night' ? '#FFFF99' : '#87CEEB';
              const windowGlow = timeOfDay === 'night' ? 'inset 0 0 5px rgba(255, 255, 153, 0.8)' : 'none';
              
              // Оконная рама
              groundTiles.push(
                <div
                  key={`window-frame-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: '#A0522D',
                    boxShadow: 'inset 0 0 0 2px #8B4513',
                  }}
                />
              );
              
              // Стекло окна
              groundTiles.push(
                <div
                  key={`window-glass-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${(x + 0.1) * PIXEL_SIZE}px`,
                    top: `${(y + 0.1) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE * 0.8}px`,
                    height: `${PIXEL_SIZE * 0.8}px`,
                    backgroundColor: windowColor,
                    boxShadow: windowGlow,
                    borderRadius: '2px',
                  }}
                />
              );
              
              // Оконные переплеты
              groundTiles.push(
                <div
                  key={`window-divider-h-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${(x + 0.1) * PIXEL_SIZE}px`,
                    top: `${(y + 0.5) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE * 0.8}px`,
                    height: `${PIXEL_SIZE * 0.05}px`,
                    backgroundColor: '#A0522D',
                  }}
                />
              );
              
              groundTiles.push(
                <div
                  key={`window-divider-v-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${(x + 0.5) * PIXEL_SIZE}px`,
                    top: `${(y + 0.1) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE * 0.05}px`,
                    height: `${PIXEL_SIZE * 0.8}px`,
                    backgroundColor: '#A0522D',
                  }}
                />
              );
            } 
            // Дверь с реалистичными деталями
            else if (y >= GRID_HEIGHT / 2 + 6 && y < GRID_HEIGHT / 2 + 9 && x >= 5 && x <= 6) {
              const doorColor = '#8B0000';
              
              // Дверная панель
              groundTiles.push(
                <div
                  key={`door-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: doorColor,
                    boxShadow: x === 5 ? 'inset -1px 0 3px rgba(0, 0, 0, 0.3)' : 'inset 1px 0 3px rgba(0, 0, 0, 0.3)',
                  }}
                />
              );
              
              // Дверные панели (декоративные элементы)
              if (y === GRID_HEIGHT / 2 + 7 && x === 5) {
                // Дверная ручка
                groundTiles.push(
                  <div
                    key={`doorknob-${x}-${y}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${(x + 0.7) * PIXEL_SIZE}px`,
                      top: `${(y + 0.5) * PIXEL_SIZE}px`,
                      width: `${PIXEL_SIZE * 0.2}px`,
                      height: `${PIXEL_SIZE * 0.2}px`,
                      backgroundColor: '#FFD700',
                      boxShadow: '0 0 2px 1px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                );
              }
            } else {
              // Обычные стены с текстурой дерева
              groundTiles.push(
                <div
                  key={`shop-wall-${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * PIXEL_SIZE}px`,
                    top: `${y * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE}px`,
                    height: `${PIXEL_SIZE}px`,
                    backgroundColor: wallColor,
                    boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.2)',
                  }}
                />
              );
              
              // Декоративные доски для текстуры (горизонтальные)
              if (y % 2 === 0) {
                groundTiles.push(
                  <div
                    key={`shop-wood-h-${x}-${y}`}
                    className="absolute"
                    style={{
                      left: `${x * PIXEL_SIZE}px`,
                      top: `${(y + 0.9) * PIXEL_SIZE}px`,
                      width: `${PIXEL_SIZE}px`,
                      height: `${PIXEL_SIZE * 0.1}px`,
                      backgroundColor: adjustColorBrightness(wallColor, -20),
                    }}
                  />
                );
              }
            }
          } 
          // Крыша магазина с текстурой черепицы
          else if (y < GRID_HEIGHT / 2) {
            const distFromMiddle = Math.abs(x - SHOP_END_X / 2); 
            const roofHeight = Math.floor(SHOP_END_X / 4 - distFromMiddle / 2);
            const roofY = GRID_HEIGHT / 2 - 1;
            
            if (y >= roofY - roofHeight && y <= roofY) {
              const roofBaseColor = '#8B0000'; // Темно-красный цвет
              const roofShade = Math.sin(x * 0.8) * 10;
              const roofColor = adjustColorBrightness(roofBaseColor, roofShade);
              
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
                    boxShadow: 'inset 0 -1px 3px rgba(0, 0, 0, 0.3)',
                  }}
                />
              );
              
              // Декоративные элементы крыши - черепица
              if ((x + y) % 2 === 0) {
                groundTiles.push(
                  <div
                    key={`roof-tile-${x}-${y}`}
                    className="absolute"
                    style={{
                      left: `${(x + 0.1) * PIXEL_SIZE}px`,
                      top: `${(y + 0.7) * PIXEL_SIZE}px`,
                      width: `${PIXEL_SIZE * 0.8}px`,
                      height: `${PIXEL_SIZE * 0.3}px`,
                      backgroundColor: adjustColorBrightness(roofColor, -15),
                      borderBottomLeftRadius: '40%',
                      borderBottomRightRadius: '40%',
                    }}
                  />
                );
              }
            }
          }
          // Фундамент и трава вокруг магазина
          else {
            const grassBaseColor = timeOfDay === 'night' ? '#006400' : '#32CD32';
            const grassVariation = Math.sin(x * 0.7) * 10;
            const grassColor = adjustColorBrightness(grassBaseColor, grassVariation);
            
            groundTiles.push(
              <div
                key={`grass-foundation-${x}-${y}`}
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
            
            // Детали травы - травинки
            if (Math.random() > 0.7) {
              groundTiles.push(
                <div
                  key={`grass-blade-${x}-${y}-${Math.random()}`}
                  className="absolute"
                  style={{
                    left: `${(x + 0.3 + Math.random() * 0.4) * PIXEL_SIZE}px`,
                    top: `${(y - 0.2) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE * 0.1}px`,
                    height: `${PIXEL_SIZE * 0.5}px`,
                    backgroundColor: adjustColorBrightness(grassColor, 20),
                    transform: `rotate(${-10 + Math.random() * 20}deg)`,
                    transformOrigin: 'bottom',
                  }}
                />
              );
            }
          }
        } 
        // Песок и трава между зданием и рекой
        else {
          // Определяем переходную зону
          const distFromShop = x - SHOP_END_X;
          const distFromRiver = RIVER_START_X - x;
          const transitionWidth = (RIVER_START_X - SHOP_END_X) / 3;
          
          // Зона травы возле магазина
          if (distFromShop < transitionWidth) {
            const grassIntensity = 1 - distFromShop / transitionWidth;
            const grassBaseColor = timeOfDay === 'night' ? '#006400' : '#32CD32';
            const grassVariation = Math.sin(x * 0.7 + y * 0.5) * 10;
            const grassColor = adjustColorBrightness(grassBaseColor, grassVariation);
            
            groundTiles.push(
              <div
                key={`grass-area-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * PIXEL_SIZE}px`,
                  top: `${y * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: grassColor,
                  opacity: 0.7 + grassIntensity * 0.3,
                }}
              />
            );
            
            // Детали травы
            if (Math.random() > 0.8) {
              for (let i = 0; i < 2; i++) {
                groundTiles.push(
                  <div
                    key={`grass-detail-${x}-${y}-${i}`}
                    className="absolute"
                    style={{
                      left: `${(x + 0.2 + Math.random() * 0.6) * PIXEL_SIZE}px`,
                      top: `${(y - 0.1 - Math.random() * 0.3) * PIXEL_SIZE}px`,
                      width: `${PIXEL_SIZE * 0.1}px`,
                      height: `${PIXEL_SIZE * (0.3 + Math.random() * 0.3)}px`,
                      backgroundColor: adjustColorBrightness(grassColor, 25),
                      transform: `rotate(${-15 + Math.random() * 30}deg)`,
                      transformOrigin: 'bottom',
                    }}
                  />
                );
              }
            }
          } 
          // Песок ближе к реке
          else {
            const sandIntensity = distFromRiver / transitionWidth;
            const sandVariation = Math.floor(Math.random() * 15);
            const sandBaseColor = timeOfDay === 'night' 
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
                  backgroundColor: sandBaseColor,
                  boxShadow: 'inset 0 0 3px rgba(0, 0, 0, 0.1)',
                }}
              />
            );
            
            // Детали песка - камешки разного размера и оттенков
            if (Math.random() > 0.85) {
              const stoneSize = 0.1 + Math.random() * 0.2;
              const stoneColor = `rgb(${150 + Math.floor(Math.random() * 50)}, ${150 + Math.floor(Math.random() * 50)}, ${150 + Math.floor(Math.random() * 30)})`;
              
              groundTiles.push(
                <div
                  key={`stone-${x}-${y}-${Math.random()}`}
                  className="absolute rounded-full"
                  style={{
                    left: `${(x + 0.3 + Math.random() * 0.4) * PIXEL_SIZE}px`,
                    top: `${(y + 0.3 + Math.random() * 0.4) * PIXEL_SIZE}px`,
                    width: `${PIXEL_SIZE * stoneSize}px`,
                    height: `${PIXEL_SIZE * stoneSize}px`,
                    backgroundColor: stoneColor,
                    boxShadow: `inset -1px -1px 2px rgba(0, 0, 0, 0.2), 
                                ${timeOfDay !== 'night' ? '1px 1px 1px rgba(255, 255, 255, 0.1)' : ''}`,
                  }}
                />
              );
            }
            
            // Следы на песке (добавляем редкие следы ближе к воде)
            if (distFromRiver < 3 && Math.random() > 0.95) {
              for (let i = 0; i < 3; i++) {
                const footprintOffset = i * 0.3;
                groundTiles.push(
                  <div
                    key={`footprint-${x}-${y}-${i}`}
                    className="absolute"
                    style={{
                      left: `${(x + 0.4) * PIXEL_SIZE}px`,
                      top: `${(y + 0.3 + footprintOffset) * PIXEL_SIZE}px`,
                      width: `${PIXEL_SIZE * 0.2}px`,
                      height: `${PIXEL_SIZE * 0.4}px`,
                      backgroundColor: adjustColorBrightness(sandBaseColor, -15),
                      borderRadius: '50%',
                      transform: `rotate(${20 * (i % 2 === 0 ? 1 : -1)}deg)`,
                      opacity: 0.7,
                    }}
                  />
                );
              }
            }
          }
        }
      }
    }
    
    return [...skyTiles, ...groundTiles];
  }, [timeOfDay, GRID_HEIGHT, GRID_WIDTH, PIXEL_SIZE, RIVER_START_X, SHOP_END_X, getSkyColors, getWaterColors]);
  
  // Отрисовка облаков
  const renderClouds = useCallback(() => {
    return clouds.map((cloud, index) => {
      const cloudParts = [];
      
      // Размер и форма облака
      const cloudWidth = cloud.width;
      const cloudHeight = 2;
      
      for (let y = 0; y < cloudHeight; y++) {
        for (let x = 0; x < cloudWidth; x++) {
          // Создаем более естественную форму облака
          const distFromCenter = Math.sqrt(
            Math.pow(x - cloudWidth/2, 2) / Math.pow(cloudWidth/2, 2) + 
            Math.pow(y - cloudHeight/2, 2) / Math.pow(cloudHeight/2, 2)
          );
          
          if (distFromCenter <= 1) {
            // Основной цвет облака в зависимости от времени суток
            const cloudBaseColor = timeOfDay === 'night' ? '#555555' : '#FFFFFF';
            
            // Тени для объемности
            const shade = Math.sin(distFromCenter * Math.PI) * 20;
            const cloudColor = adjustColorBrightness(cloudBaseColor, shade);
            
            // Прозрачнее по краям
            const edgeFactor = (1 - distFromCenter) * 0.7;
            
            cloudParts.push(
              <div
                key={`cloud-${index}-${x}-${y}`}
                className="absolute rounded-full"
                style={{
                  left: `${(cloud.x / PIXEL_SIZE + x) * PIXEL_SIZE}px`,
                  top: `${(cloud.y / PIXEL_SIZE + y) * PIXEL_SIZE}px`,
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  backgroundColor: cloudColor,
                  opacity: (cloud.opacity - distFromCenter * 0.3) * edgeFactor,
                  boxShadow: timeOfDay !== 'night' ? 'inset 0 -2px 3px rgba(0, 0, 0, 0.1)' : 'none',
                }}
              />
            );
          }
        }
      }
      
      return cloudParts;
    });
  }, [clouds, timeOfDay, PIXEL_SIZE]);
  
  // Рендеринг птиц с улучшенными деталями
  const renderBirds = useCallback(() => {
    return birds.map((bird, index) => {
      const birdParts = [];
      
      // Цвета птиц в зависимости от времени суток
      const birdBodyColor = timeOfDay === 'night' ? '#708090' : '#000000';
      const birdWingColor = timeOfDay === 'night' ? '#A9A9A9' : '#555555';
      
      // Анимация крыльев (более плавная)
      const wingRotation = Math.sin(Date.now() * 0.005 + index) * 30;
      
      // Создаем тело птицы
      birdParts.push(
        <div 
          key={`bird-body-${index}`}
          className="absolute"
          style={{ 
            left: `${bird.x}px`,
            top: `${bird.y}px`,
            width: `${PIXEL_SIZE * bird.size}px`, 
            height: `${PIXEL_SIZE * bird.size * 0.5}px`, 
            backgroundColor: birdBodyColor,
            borderTopRightRadius: '50%',
            borderTopLeftRadius: '30%',
            borderBottomRightRadius: '30%',
            transform: `scaleX(${bird.direction})`,
          }}
        />
      );
      
      // Голова птицы
      birdParts.push(
        <div 
          key={`bird-head-${index}`}
          className="absolute"
          style={{ 
            left: `${bird.x + (bird.direction === 1 ? PIXEL_SIZE * bird.size * 0.7 : 0)}px`,
            top: `${bird.y - PIXEL_SIZE * bird.size * 0.2}px`,
            width: `${PIXEL_SIZE * bird.size * 0.3}px`, 
            height: `${PIXEL_SIZE * bird.size * 0.3}px`, 
            backgroundColor: birdBodyColor,
            borderRadius: '50%',
            transform: `scaleX(${bird.direction})`,
          }}
        />
      );
      
      // Клюв птицы
      birdParts.push(
        <div 
          key={`bird-beak-${index}`}
          className="absolute"
          style={{ 
            left: `${bird.x + (bird.direction === 1 ? PIXEL_SIZE * bird.size * 0.95 : -PIXEL_SIZE * bird.size * 0.15)}px`,
            top: `${bird.y - PIXEL_SIZE * bird.size * 0.1}px`,
            width: `${PIXEL_SIZE * bird.size * 0.15}px`, 
            height: `${PIXEL_SIZE * bird.size * 0.1}px`, 
            backgroundColor: '#FF9900',
            transform: `scaleX(${bird.direction})`,
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
          }}
        />
      );
      
      // Крылья птицы (с анимацией)
      birdParts.push(
        <div 
          key={`bird-wing-${index}`}
          className="absolute origin-left"
          style={{ 
            left: `${bird.x + PIXEL_SIZE * bird.size * 0.3}px`,
            top: `${bird.y + PIXEL_SIZE * bird.size * 0.1}px`,
            width: `${PIXEL_SIZE * bird.size * 0.6}px`, 
            height: `${PIXEL_SIZE * bird.size * 0.2}px`, 
            backgroundColor: birdWingColor,
            transform: `rotate(${wingRotation}deg) scaleX(${bird.direction})`,
            transformOrigin: bird.direction === 1 ? 'left' : 'right',
            borderTopRightRadius: '60%',
            borderBottomRightRadius: '40%',
          }}
        />
      );
      
      return birdParts;
    });
  }, [birds, timeOfDay, PIXEL_SIZE]);
  
  // Функция для интерполяции цветов RGB
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    const parse = (color: string) => {
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
      }
      return [0, 0, 0];
    };
    
    const c1 = parse(color1);
    const c2 = parse(color2);
    
    const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Функция для затемнения цвета
  const darkShade = (color: string, amount = 30) => {
    return adjustColorBrightness(color, -amount);
  };
  
  // Функция для изменения яркости цвета
  const adjustColorBrightness = (color: string, amount: number) => {
    const parse = (color: string) => {
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
      } else if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
          return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
        }
      }
      return [0, 0, 0];
    };
    
    const c = parse(color);
    
    const r = Math.max(0, Math.min(255, c[0] + amount));
    const g = Math.max(0, Math.min(255, c[1] + amount));
    const b = Math.max(0, Math.min(255, c[2] + amount));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Проверка, находится ли игрок в зоне реки
  const isPlayerNearRiver = position.x > window.innerWidth * 0.7;
  
  // Проверка, находится ли игрок в зоне магазина
  const isPlayerNearShop = position.x < window.innerWidth * 0.3;
  
  // Открытие/закрытие магазина
  const toggleShop = useCallback(() => {
    if (isPlayerNearShop) {
      setShopOpened(!shopOpened);
    }
  }, [isPlayerNearShop, shopOpened]);
  
  // Обработчик клавиши E для входа в магазин
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        if (isPlayerNearShop) {
          toggleShop();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlayerNearShop, toggleShop]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Индикатор времени суток */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 px-3 py-1 rounded-full text-white text-xs">
        {timeOfDay === 'morning' && '🌅 Утро'}
        {timeOfDay === 'day' && '☀️ День'}
        {timeOfDay === 'evening' && '🌇 Вечер'}
        {timeOfDay === 'night' && '🌙 Ночь'}
      </div>
      
      {/* Пиксельный мир с улучшенной графикой */}
      <PixelGrid 
        width={GRID_WIDTH} 
        height={GRID_HEIGHT} 
        pixelSize={PIXEL_SIZE} 
        className="mx-auto my-auto"
        showGrid={false}
      >
        {renderWorld()}
        {renderClouds()}
        {renderBirds()}
        
        {/* Вывеска магазина */}
        <div 
          className={`absolute px-2 py-1 ${timeOfDay === 'night' ? 'bg-yellow-800/80' : 'bg-amber-800/80'} text-white text-xs rounded-md border border-amber-900 z-30`}
          style={{
            left: `${3 * PIXEL_SIZE}px`,
            top: `${(GRID_HEIGHT / 2 - 2) * PIXEL_SIZE}px`,
          }}
        >
          РЫБНЫЙ МАГАЗИН
        </div>
        
        {/* Подсветка входа в магазин */}
        {isPlayerNearShop && (
          <div 
            className="absolute text-white text-xs bg-white/20 px-2 py-1 rounded-md z-30 animate-pulse"
            style={{
              left: `${5.5 * PIXEL_SIZE}px`,
              top: `${(GRID_HEIGHT / 2 + 5) * PIXEL_SIZE}px`,
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
        <div className="absolute right-4 top-1/3 p-4 bg-blue-900/80 border-2 border-blue-700 rounded-lg text-white max-w-xs z-40 backdrop-blur-sm">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4 backdrop-blur-sm">
          <div className="bg-amber-900 border-4 border-amber-800 rounded-lg p-5 max-w-md w-full relative shadow-xl">
            <Button 
              onClick={() => setShopOpened(false)}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
            >
              ✕
            </Button>
            
            <h2 className="text-xl text-amber-200 mb-4 text-center font-semibold">Рыбный Магазин</h2>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-amber-950/50 p-3 rounded-md shadow-inner">
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
              
              <div className="bg-amber-950/50 p-3 rounded-md shadow-inner">
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
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white flex gap-4 items-center z-40 backdrop-blur-sm">
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
      <div className="absolute bottom-4 right-4 p-2 bg-black/70 text-white text-xs rounded-md z-40 backdrop-blur-sm">
        <div><strong>WASD / Стрелки</strong> - перемещение</div>
        <div><strong>E</strong> - войти в магазин (когда рядом)</div>
        <div>Рыбалка справа, магазин слева</div>
        <div>Время суток влияет на улов!</div>
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Player from '@/components/Player';
import Inventory from '@/components/Inventory';
import FishingSpot from '@/components/FishingSpot';

type Fish = {
  id: number;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  icon: string;
};

export default function Game() {
  const [money, setMoney] = useState<number>(0);
  const [inventory, setInventory] = useState<Fish[]>([]);
  const [position, setPosition] = useState({ x: 400, y: 400 });
  const [isFishing, setIsFishing] = useState(false);
  const [currentRod, setCurrentRod] = useState({
    name: 'Обычная удочка',
    multiplier: 1,
    price: 0,
  });

  const handleMovement = (newX: number, newY: number) => {
    setPosition({ x: newX, y: newY });
  };

  const startFishing = () => {
    if (isFishing) return;
    
    setIsFishing(true);
    
    // Случайное время ожидания между 5 и 15 секундами
    const waitTime = Math.floor(Math.random() * 10000) + 5000;
    
    setTimeout(() => {
      const catchItem = getCatchItem(currentRod.multiplier);
      setInventory(prev => [...prev, catchItem]);
      setIsFishing(false);
    }, waitTime);
  };

  const getCatchItem = (multiplier: number): Fish => {
    // Общий пул возможных предметов
    const items: Fish[] = [
      { id: 1, name: 'Мусор', rarity: 'common', price: 1, icon: '🗑️' },
      { id: 2, name: 'Карась', rarity: 'common', price: 10, icon: '🐟' },
      { id: 3, name: 'Окунь', rarity: 'common', price: 15, icon: '🐟' },
      { id: 4, name: 'Щука', rarity: 'uncommon', price: 30, icon: '🐠' },
      { id: 5, name: 'Сом', rarity: 'uncommon', price: 50, icon: '🐠' },
      { id: 6, name: 'Морской конёк', rarity: 'rare', price: 80, icon: '🐙' },
      { id: 7, name: 'Морской ёж', rarity: 'rare', price: 100, icon: '🦔' },
      { id: 8, name: 'Медуза', rarity: 'rare', price: 120, icon: '🧠' },
      { id: 9, name: 'Дельфин', rarity: 'epic', price: 200, icon: '🐬' },
      { id: 10, name: 'Акула', rarity: 'epic', price: 300, icon: '🦈' },
      { id: 11, name: 'Кит', rarity: 'legendary', price: 500, icon: '🐋' }
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-blue-100">
      {/* Небо и солнце */}
      <div className="absolute inset-0 h-1/2 bg-gradient-to-b from-sky-300 to-sky-500">
        <div className="absolute top-16 right-24 w-16 h-16 bg-yellow-300 rounded-full" />
      </div>
      
      {/* Пляж */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-yellow-200">
        {/* Река */}
        <div className="absolute right-0 inset-y-0 w-1/4 bg-blue-500">
          {position.x > window.innerWidth * 0.75 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                disabled={isFishing}
                onClick={startFishing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isFishing ? 'Ждем поклевку...' : 'Закинуть удочку'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Продавец слева */}
        <div className="absolute left-0 inset-y-0 w-1/4 bg-amber-100 flex flex-col">
          <div className="p-4 bg-amber-200 text-center font-bold">
            Торговец (Деньги: {money} монет)
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="font-bold">Продать улов</h3>
              {inventory.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {inventory.map(fish => (
                    <li key={`${fish.id}-${Math.random()}`} className="flex justify-between items-center">
                      <span>{fish.icon} {fish.name}</span>
                      <Button 
                        onClick={() => sellFish(fish.id)}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        Продать за {fish.price}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm mt-2">Инвентарь пуст</p>
              )}
            </div>
            
            <div>
              <h3 className="font-bold">Купить удочку</h3>
              <ul className="space-y-2 mt-2">
                <li className="flex justify-between items-center">
                  <span>Железная (×1.5)</span>
                  <Button 
                    onClick={() => buyRod('Железная удочка', 100, 1.5)}
                    disabled={money < 100 || currentRod.multiplier >= 1.5}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    Купить за 100
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span>Профессиональная (×2)</span>
                  <Button 
                    onClick={() => buyRod('Профессиональная удочка', 250, 2)}
                    disabled={money < 250 || currentRod.multiplier >= 2}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    Купить за 250
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span>Золотая (×3)</span>
                  <Button 
                    onClick={() => buyRod('Золотая удочка', 500, 3)}
                    disabled={money < 500 || currentRod.multiplier >= 3}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    Купить за 500
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Игрок */}
      <Player position={position} onMove={handleMovement} currentRod={currentRod.name} />
      
      {/* Интерфейс */}
      <div className="absolute top-4 left-4 p-4 bg-white/80 rounded shadow-md">
        <div className="text-lg font-bold">Удочка: {currentRod.name}</div>
        <div className="text-lg font-bold">Деньги: {money} монет</div>
        <div className="text-lg font-bold">Улов: {inventory.length} шт.</div>
        {isFishing && (
          <div className="mt-2 text-green-600 animate-pulse">Ловим рыбу...</div>
        )}
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FishingSpotProps {
  onCatch: (rodMultiplier: number) => void;
  isFishing: boolean;
  setIsFishing: (state: boolean) => void;
  rodMultiplier: number;
}

export default function FishingSpot({ 
  onCatch, 
  isFishing, 
  setIsFishing,
  rodMultiplier 
}: FishingSpotProps) {
  const [progress, setProgress] = useState(0);
  
  const startFishing = () => {
    if (isFishing) return;
    
    setIsFishing(true);
    setProgress(0);
    
    // Случайное время ожидания между 5 и 15 секундами
    const waitTime = Math.floor(Math.random() * 10000) + 5000;
    // Чем лучше удочка, тем быстрее ловля
    const adjustedWaitTime = waitTime / rodMultiplier;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (adjustedWaitTime / 100));
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onCatch(rodMultiplier);
            setIsFishing(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };
  
  return (
    <div className="p-4 bg-blue-700/60 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Рыбалка</h2>
      
      {isFishing ? (
        <div className="space-y-2">
          <div className="animate-pulse">Ловим рыбу...</div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <Button
          onClick={startFishing}
          className="bg-green-600 hover:bg-green-700 w-full"
        >
          Закинуть удочку
        </Button>
      )}
      
      <div className="mt-4 text-sm">
        Текущий множитель удочки: x{rodMultiplier.toFixed(1)}
      </div>
    </div>
  );
}

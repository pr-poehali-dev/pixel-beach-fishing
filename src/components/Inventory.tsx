
import { Button } from '@/components/ui/button';

interface Fish {
  id: number;
  name: string;
  rarity: string;
  price: number;
  icon: string;
}

interface InventoryProps {
  items: Fish[];
  onSell: (id: number) => void;
}

export default function Inventory({ items, onSell }: InventoryProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'uncommon': return 'text-green-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <div className="bg-white/80 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Инвентарь</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500">Инвентарь пуст</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map(item => (
            <div key={`${item.id}-${Math.random()}`} className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-medium ${getRarityColor(item.rarity)}`}>{item.name}</span>
              </div>
              <Button 
                onClick={() => onSell(item.id)}
                variant="outline"
                size="sm"
              >
                Продать за {item.price}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

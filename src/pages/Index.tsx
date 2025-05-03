
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-700 flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">Пиксельная Рыбалка</h1>
      
      <div className="w-32 h-32 mb-8 relative">
        {/* Простая пиксельная анимация */}
        <div className="w-8 h-8 bg-yellow-300 rounded-full absolute top-0 left-12"></div>
        <div className="w-24 h-12 bg-blue-700 absolute top-8 left-4 rounded-t"></div>
        <div className="w-16 h-12 bg-brown-500 absolute top-20 left-8"></div>
        <div className="w-4 h-16 bg-brown-700 absolute top-8 right-4"></div>
        <div className="w-8 h-4 bg-red-500 absolute top-4 right-0"></div>
        <div className="w-8 h-8 bg-blue-400 rounded-full absolute bottom-0 right-8 animate-bounce"></div>
      </div>
      
      <p className="text-lg md:text-xl mb-8 max-w-md text-center">
        Ловите разнообразных рыб, улучшайте снаряжение и станьте лучшим рыбаком на пиксельном пляже!
      </p>
      
      <Link to="/game">
        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 text-lg rounded-lg transform transition hover:scale-105">
          Начать игру
        </Button>
      </Link>
      
      <div className="mt-12 bg-black/20 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">Как играть:</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Используйте <strong>стрелки</strong> или <strong>WASD</strong> для перемещения</li>
          <li>Подойдите к реке и нажмите кнопку "Закинуть удочку"</li>
          <li>Терпеливо ждите поклевки (от 5 до 15 секунд)</li>
          <li>Продавайте улов слева торговцу и улучшайте удочки</li>
          <li>Собирайте редкие виды рыб и других морских обитателей!</li>
        </ul>
      </div>
    </div>
  );
}

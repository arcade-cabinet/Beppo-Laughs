import { useState } from 'react';
import { Scene } from '@/components/game/Scene';
import { MainMenu } from '@/components/game/MainMenu';
import { HUD } from '@/components/game/HUD';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState<string>('');

  const handleStart = (selectedSeed: string) => {
    setSeed(selectedSeed);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!isPlaying && <MainMenu onStart={handleStart} />}
      
      {isPlaying && (
        <>
          <div className="absolute inset-0 z-0">
             <Scene seed={seed} />
          </div>
          <HUD />
        </>
      )}
    </div>
  );
}

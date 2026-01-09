import { Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useGameStore } from '@/game/store';

export function SettingsModal() {
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useGameStore((state) => state.setGraphicsQuality);
  const [volume, setVolume] = useState([80]);

  const getQualityValue = (q: string) => (q === 'high' ? 100 : q === 'medium' ? 50 : 0);
  const handleQualityChange = (val: number[]) => {
    const v = val[0];
    if (v < 33) setGraphicsQuality('low');
    else if (v < 66) setGraphicsQuality('medium');
    else setGraphicsQuality('high');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="w-8 h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/20 text-foreground sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-horror text-3xl text-secondary text-center tracking-wider">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-8 py-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="graphics" className="font-creepy text-xl">
                Graphics Quality
              </Label>
              <span className="font-mono text-sm text-muted-foreground">
                {graphicsQuality.toUpperCase()}
              </span>
            </div>
            <Slider
              id="graphics"
              max={100}
              step={10}
              value={[getQualityValue(graphicsQuality)]}
              onValueChange={handleQualityChange}
              className="[&>.relative>.bg-primary]:bg-primary/50 [&>.relative>.bg-primary]:h-2"
            />
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume" className="font-creepy text-xl">
                Volume
              </Label>
              <span className="font-mono text-sm text-muted-foreground">{volume}%</span>
            </div>
            <Slider
              id="volume"
              max={100}
              step={5}
              value={volume}
              onValueChange={setVolume}
              className="[&>.relative>.bg-primary]:bg-primary/50 [&>.relative>.bg-primary]:h-2"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

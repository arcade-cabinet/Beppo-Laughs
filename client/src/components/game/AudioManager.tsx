import { useEffect, useRef } from 'react';
import { useGameStore } from '../../game/store';
import { audioSystem } from '../../game/audio';

export function AudioManager() {
  const { fear, despair, isGameOver } = useGameStore();
  const sanityLevel = useGameStore(state => state.getSanityLevel());
  
  const lastFear = useRef(0);
  const lastSanityCheck = useRef(0);
  const droneStarted = useRef(false);
  
  // Initialize audio on user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      await audioSystem.init();
      await audioSystem.resume();
      
      // Start ambient drone
      if (!droneStarted.current) {
        audioSystem.startAmbientDrone(fear / 100);
        droneStarted.current = true;
      }
      
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      audioSystem.cleanup();
      droneStarted.current = false;
    };
  }, []);
  
  // Update drone intensity based on fear
  useEffect(() => {
    audioSystem.updateDroneIntensity(fear);
  }, [fear]);
  
  // Play sounds on fear spikes (villain encounters)
  useEffect(() => {
    if (fear > lastFear.current + 10) {
      // Fear spike - villain appeared
      audioSystem.playJumpScare();
    } else if (fear > lastFear.current + 3) {
      // Smaller fear increase
      audioSystem.playCreepyLaugh(0.4 + (fear / 100) * 0.4);
    }
    lastFear.current = fear;
  }, [fear]);
  
  // Sanity distortion sounds
  useEffect(() => {
    const now = Date.now();
    if (sanityLevel < 50 && now - lastSanityCheck.current > 3000) {
      audioSystem.playSanityDistortion(sanityLevel);
      lastSanityCheck.current = now;
    }
  }, [sanityLevel]);
  
  // Game over sequence
  useEffect(() => {
    if (isGameOver) {
      audioSystem.playJumpScare();
      setTimeout(() => {
        audioSystem.playCreepyLaugh(1.0);
      }, 500);
    }
  }, [isGameOver]);
  
  return null;
}

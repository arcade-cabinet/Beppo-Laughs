import { ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useMemo } from 'react';
import { Vector2 } from 'three';
import { useGameStore } from '../../game/store';

/**
 * Post-processing horror effects that respond to sanity level.
 * Uses @react-three/postprocessing for GPU-accelerated effects.
 *
 * Effects:
 * - Vignette: Darkens edges, intensifies with insanity
 * - ChromaticAberration: RGB color shift, increases with fear
 * - Noise: Film grain for gritty atmosphere
 */
export function HorrorEffects() {
  const fear = useGameStore((state) => state.fear);
  const despair = useGameStore((state) => state.despair);
  const maxSanity = useGameStore((state) => state.maxSanity);

  // Calculate insanity level (0-1)
  const insanity = useMemo(() => {
    return (fear + despair) / 2 / maxSanity;
  }, [fear, despair, maxSanity]);

  // Chromatic aberration offset scales with fear
  const chromaticOffset = useMemo(() => {
    const baseOffset = 0.001;
    const fearOffset = (fear / maxSanity) * 0.004;
    return new Vector2(baseOffset + fearOffset, baseOffset + fearOffset * 0.5);
  }, [fear, maxSanity]);

  // Vignette darkness scales with despair
  const vignetteDarkness = useMemo(() => {
    const baseDarkness = 0.4;
    const despairDarkness = (despair / maxSanity) * 0.6;
    return baseDarkness + despairDarkness;
  }, [despair, maxSanity]);

  // Noise intensity scales with overall insanity
  const noiseIntensity = useMemo(() => {
    const baseNoise = 0.08;
    const insanityNoise = insanity * 0.15;
    return baseNoise + insanityNoise;
  }, [insanity]);

  return (
    <EffectComposer>
      {/* Vignette - darker edges, intensifies with despair */}
      <Vignette offset={0.3} darkness={vignetteDarkness} blendFunction={BlendFunction.NORMAL} />

      {/* Chromatic aberration - color distortion with fear */}
      <ChromaticAberration
        offset={chromaticOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />

      {/* Film grain noise for gritty horror atmosphere */}
      <Noise opacity={noiseIntensity} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}

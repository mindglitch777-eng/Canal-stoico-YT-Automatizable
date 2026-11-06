import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, parseEmphasis} from '../anim';
import {syncTokens} from '../director';
import {Decode, KineticText, Shockwave} from '../kinetic';
import type {SceneProps} from '../Short';
import {Stage} from '../stage';
import {color, font, stage, W} from '../theme';
import type {HookScene} from '../types';

// Gancho: interrupción de patrón desde el cuadro 0. La cámara entra de golpe,
// el dato aparece descifrándose y cada palabra cae al ritmo exacto de la voz.
export const Hook: React.FC<SceneProps<HookScene>> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // Entrada brusca: todo el bloque llega desde muy cerca (zoom 1.9 → 1) en 9 cuadros.
  const rush = interpolate(frame, [0, 9], [1.9, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 4});
  const tokens = scene.text.split('\n').flatMap((l) => parseEmphasis(l));
  const times = syncTokens(tokens.map((t) => t.word), scene.words, 1.4);
  const goldHits = tokens.map((t, i) => (t.gold ? Math.round(times[i] * fps) + 4 : null)).filter((x): x is number => x !== null);
  const barP = interpolate(frame, [10, 30], [0, 1], clamp);
  return (
    <>
      {goldHits.map((h, i) => (
        <Shockwave key={i} at={h} x={W / 2} y={stage.centerY + 20} size={1200} />
      ))}
      <Stage style={{transform: `scale(${rush})`}}>
        {scene.kicker ? (
          <Decode
            text={scene.kicker.toUpperCase()}
            style={{fontFamily: font.sans, fontWeight: 800, fontSize: 34, letterSpacing: '0.32em', color: color.gold, marginBottom: 46, textShadow: '0 0 18px rgba(232,184,90,0.6)'}}
          />
        ) : null}
        <KineticText
          text={scene.text}
          words={scene.words}
          entry="slam"
          lead={2}
          style={{fontFamily: font.serif, fontWeight: 700, fontSize: 118, lineHeight: 1.02, letterSpacing: '-0.01em'}}
          goldScale={1.14}
        />
        <div
          style={{
            marginTop: 56,
            width: 520 * barP,
            height: 5,
            background: `linear-gradient(90deg, transparent, ${color.gold}, #FFE7A3, ${color.gold}, transparent)`,
            boxShadow: '0 0 24px rgba(232,184,90,0.9)',
          }}
        />
      </Stage>
    </>
  );
};

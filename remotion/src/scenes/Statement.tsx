import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, parseEmphasis} from '../anim';
import {syncTokens} from '../director';
import {useLocalEnergy} from '../fx';
import {Decode, KineticText, Shockwave} from '../kinetic';
import type {SceneProps} from '../Short';
import {Stage} from '../stage';
import {color, font, stage, W} from '../theme';
import type {OutroScene, StatementScene} from '../types';

const goldTimes = (text: string, scene: StatementScene | OutroScene, fps: number) => {
  const tokens = text.split('\n').flatMap((l) => parseEmphasis(l));
  const times = syncTokens(tokens.map((t) => t.word), scene.words, 1.6);
  return tokens.map((t, i) => (t.gold ? Math.round(times[i] * fps) + 3 : null)).filter((x): x is number => x !== null);
};

// Frase central: las líneas salen desde detrás de una máscara al ritmo de la voz.
// Detrás, la palabra clave gigante en contorno, en otra profundidad (paralaje).
export const Statement: React.FC<SceneProps<StatementScene>> = ({scene, durationInFrames, startFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const energy = useLocalEnergy(startFrame);
  const key = parseEmphasis(scene.text.replace(/\n/g, ' ')).filter((t) => t.gold).pop()?.word.replace(/[^\w']/g, '') ?? '';
  const hits = goldTimes(scene.text, scene, fps);
  const sweep = interpolate(frame, [durationInFrames * 0.55, durationInFrames * 0.85], [-60, 160], clamp);
  return (
    <>
      {/* Palabra gigante en contorno, lejos */}
      <div
        style={{
          position: 'absolute',
          top: stage.centerY - 260,
          left: 0,
          width: W,
          textAlign: 'center',
          fontFamily: font.serif,
          fontWeight: 700,
          fontSize: 520,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '2px rgba(232,184,90,0.22)',
          transform: `translateZ(-500px) scale(${1.5 + frame * 0.003}) rotate(${-4 + frame * 0.03}deg)`,
          whiteSpace: 'nowrap',
          opacity: interpolate(frame, [0, 12], [0, 1], clamp),
        }}
      >
        {key.toUpperCase()}
      </div>
      {hits.map((h, i) => (
        <Shockwave key={i} at={h} x={W / 2} y={stage.centerY} size={1000} />
      ))}
      <Stage style={{transform: `scale(${1 + energy * 0.05}) rotateX(${Math.sin(frame / 25) * 4}deg)`}}>
        <div style={{position: 'relative'}}>
          <KineticText
            text={scene.text}
            words={scene.words}
            entry="mask"
            lead={3}
            style={{fontFamily: font.serif, fontWeight: 700, fontSize: 96, lineHeight: 1.08}}
            goldScale={1.16}
          />
          {/* Barrido de luz diagonal cuando la frase ya está completa */}
          <div
            style={{
              position: 'absolute',
              inset: '-10% -20%',
              background: `linear-gradient(110deg, transparent ${sweep - 12}%, rgba(255,240,200,0.32) ${sweep}%, transparent ${sweep + 12}%)`,
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
            }}
          />
        </div>
      </Stage>
    </>
  );
};

// Cierre: la moneda 3D gira arriba (la dibuja el mundo 3D), un anillo se cierra a su alrededor
// y la frase final aparece debajo. El anillo completo invita a volver a ver (loop).
export const Outro: React.FC<SceneProps<OutroScene>> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = 300;
  const circ = 2 * Math.PI * r;
  const p = interpolate(frame, [6, Math.max(20, durationInFrames - 8)], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 2});
  const cy = 556;
  const hits = goldTimes(scene.text, scene, fps);
  return (
    <>
      <svg width={W} height={1200} style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}>
        <defs>
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={W / 2} cy={cy} r={r} fill="none" stroke={color.goldDim} strokeWidth={3} />
        <circle
          cx={W / 2}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F0C35E"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - p)}
          transform={`rotate(-90 ${W / 2} ${cy})`}
          filter="url(#ringGlow)"
        />
        {/* Chispa en la punta del anillo */}
        <circle
          cx={W / 2 + Math.cos(-Math.PI / 2 + p * Math.PI * 2) * r}
          cy={cy + Math.sin(-Math.PI / 2 + p * Math.PI * 2) * r}
          r={14}
          fill="#FFF4C9"
          filter="url(#ringGlow)"
          opacity={p < 0.999 ? 1 : 0}
        />
      </svg>
      {hits.map((h, i) => (
        <Shockwave key={i} at={h} x={W / 2} y={cy} size={1100} />
      ))}
      <Stage top={900} bottom={1170}>
        <KineticText
          text={scene.text}
          words={scene.words}
          entry="flip"
          lead={3}
          style={{fontFamily: font.serif, fontWeight: 700, fontSize: 86, lineHeight: 1.05}}
        />
        <Decode
          text="CALM FORTUNE"
          startFrame={18}
          style={{marginTop: 30, fontFamily: font.sans, fontWeight: 800, fontSize: 28, letterSpacing: '0.45em', color: color.gold}}
        />
      </Stage>
    </>
  );
};

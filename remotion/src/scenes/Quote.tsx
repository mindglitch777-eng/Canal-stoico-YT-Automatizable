import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../anim';
import {norm, syncTokens} from '../director';
import {useLocalEnergy} from '../fx';
import {Decode, goldStyle, inkStyle, KineticText} from '../kinetic';
import type {SceneProps} from '../Short';
import {Stage} from '../stage';
import {color, font} from '../theme';
import type {QuoteScene} from '../types';

// Cita en dos tiempos:
//  1) mientras la voz pone contexto, aparece el AUTOR enorme, con volumen, y la obra descifrándose;
//  2) cuando la voz dice la cita, el autor sube a una etiqueta y la cita entra palabra por palabra.
export const Quote: React.FC<SceneProps<QuoteScene>> = ({scene, startFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const energy = useLocalEnergy(startFrame);
  const qTokens = scene.quote.split(/\s+/).filter(Boolean);
  const first = norm(qTokens[0] ?? '');
  // ¿Cuándo empieza la voz a decir la cita? (primer token que coincide y le siguen los demás)
  let quoteAt = 0;
  for (let k = 0; k < scene.words.length; k++) {
    if (norm(scene.words[k].text) === first && norm(scene.words[k + 1]?.text ?? '') === norm(qTokens[1] ?? '')) {
      quoteAt = scene.words[k].start;
      break;
    }
  }
  const qf = Math.round(quoteAt * fps);
  const hasIntro = qf > 30;
  const swap = hasIntro ? spring({frame: frame - (qf - 8), fps, config: {damping: 15, stiffness: 140}}) : 1;
  const glyphSpin = interpolate(frame, [0, 40], [-160, 0], {...clamp, easing: (t) => 1 - (1 - t) ** 3}) + Math.sin(frame / 18) * 10;
  const times = syncTokens(qTokens, scene.words, 2);
  return (
    <>
      {/* 1) El autor, grande */}
      {hasIntro && swap < 0.99 ? (
        <Stage style={{opacity: 1 - swap, transform: `translateY(${-swap * 420}px) scale(${1 - swap * 0.6}) rotateX(${swap * 35}deg)`}}>
          <div style={{fontFamily: font.sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.4em', color: color.muted, marginBottom: 20}}>
            <Decode text="IN HIS WORDS" />
          </div>
          <div
            style={{
              fontFamily: font.serif,
              fontWeight: 700,
              // Achica los nombres largos para que entren en el ancho
              fontSize: Math.min(200, Math.round(1500 / Math.max(4, scene.author.length))),
              lineHeight: 0.9,
              letterSpacing: interpolate(frame, [0, 60], [0.16, 0.02], clamp) + 'em',
              transform: `scale(${interpolate(frame, [0, 120], [1.12, 1], clamp) + energy * 0.04})`,
              ...goldStyle(frame, 3, 10, 1.2),
            }}
          >
            {scene.author.toUpperCase()}
          </div>
          {scene.source ? (
            <Decode
              text={scene.source}
              startFrame={14}
              style={{fontFamily: font.serif, fontStyle: 'italic', fontSize: 54, color: color.ink, marginTop: 26, ...inkStyle(2)}}
            />
          ) : null}
        </Stage>
      ) : null}

      {/* 2) La cita */}
      {swap > 0.01 ? (
        <Stage style={{opacity: Math.min(1, swap * 1.4)}}>
          <div
            style={{
              fontFamily: font.serif,
              fontSize: 320,
              lineHeight: 0.6,
              height: 170,
              transform: `rotateY(${glyphSpin}deg) scale(${1 + energy * 0.1})`,
              ...goldStyle(frame, 9, 12, 1.3),
            }}
          >
            “
          </div>
          <KineticText
            text={scene.quote}
            words={scene.words.slice(Math.max(0, scene.words.findIndex((w) => w.start >= quoteAt - 0.01)))}
            entry="rise"
            lead={4}
            span={1.8}
            style={{fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 92, lineHeight: 1.12, maxWidth: 900, whiteSpace: 'normal'}}
            lineStyle={{whiteSpace: 'normal'}}
          />
          <div style={{marginTop: 44, display: 'flex', alignItems: 'center', gap: 22, opacity: interpolate(frame, [Math.round((times[times.length - 1] ?? 0) * fps), Math.round((times[times.length - 1] ?? 0) * fps) + 10], [0, 1], clamp)}}>
            <div style={{width: 70, height: 3, background: color.gold}} />
            <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 36, letterSpacing: '0.12em', color: color.ink}}>{scene.author.toUpperCase()}</div>
            {scene.source ? <div style={{fontFamily: font.sans, fontSize: 28, color: color.muted}}>{scene.source}</div> : null}
          </div>
        </Stage>
      ) : null}
    </>
  );
};

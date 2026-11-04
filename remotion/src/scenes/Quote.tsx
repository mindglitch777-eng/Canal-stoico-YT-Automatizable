import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, RevealText} from '../anim';
import {color, font, safe, W} from '../theme';
import type {QuoteScene} from '../types';

// Cita: comillas de oro, texto en itálica y autor con la fuente.
export const Quote: React.FC<{scene: QuoteScene; durationInFrames: number}> = ({scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const n = scene.quote.split(/\s+/).length;
  const perWord = Math.max(1, Math.min(4, Math.floor((durationInFrames * 0.55) / n)));
  const authorAt = n * perWord + 6;
  return (
    <div style={{position: 'absolute', top: safe.top + 60, left: safe.side, width: W - safe.side * 2}}>
      <div
        style={{
          fontFamily: font.serif,
          fontSize: 260,
          lineHeight: 0.8,
          color: color.gold,
          opacity: ease(frame, 0, 12) * 0.9,
          transform: `translateY(${(1 - ease(frame, 0, 12)) * -20}px)`,
          height: 150,
        }}
      >
        “
      </div>
      <RevealText
        text={scene.quote}
        perWord={perWord}
        startFrame={6}
        style={{fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 80, lineHeight: 1.12, color: color.ink}}
      />
      <div style={{marginTop: 54, opacity: ease(frame, authorAt, authorAt + 12)}}>
        <div style={{width: 80, height: 3, background: color.gold, marginBottom: 22}} />
        <div style={{fontFamily: font.sans, fontWeight: 700, fontSize: 40, color: color.ink, letterSpacing: '0.06em'}}>
          {scene.author.toUpperCase()}
        </div>
        {scene.source ? (
          <div style={{fontFamily: font.sans, fontWeight: 500, fontSize: 30, color: color.muted, marginTop: 8}}>
            {scene.source}
          </div>
        ) : null}
      </div>
    </div>
  );
};

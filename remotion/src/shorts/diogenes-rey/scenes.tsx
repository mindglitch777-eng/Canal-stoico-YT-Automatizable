// Las 11 escenas de "diogenes-rey".
import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash, syncTokens} from '../../director';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, outCubic, outExpo, useLocal, wordFrame} from '../common';
import {AlexProfile, Cracks, Hoplite, Meander, Pithos, Reclining, Rider, Sun, Tablet, V, VaseSurface} from './parts';

type P = {scene: Scene; dur: number};

const FRIEZE = (
  <>
    <Meander y={150} />
    <Meander y={1400} />
  </>
);

// La sombra del rey a caballo y su ejército (negro translúcido sobre la terracota).
const KingShadow: React.FC<{x: number; opacity?: number}> = ({x, opacity = 0.62}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
    <g transform={`translate(${x} 0)`}>
      <Rider x={-120} y={430} s={3.2} color="#0A0402" />
      {Array.from({length: 6}, (_, k) => (
        <Hoplite key={k} x={-700 + k * 110} y={760 + (k % 2) * 40} s={1.9} color="#0A0402" />
      ))}
    </g>
  </svg>
);

// ---------------- Cuadro 0 (también es el final del loop) ----------------
const SHADOW0 = -600;
export const Frame0: React.FC<{t: number; shadowX?: number; wave?: number; zoom?: number}> = ({t, shadowX = SHADOW0, wave = 0, zoom = 1}) => {
  const covered = Math.max(0, Math.min(1, (shadowX - SHADOW0) / 700));
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '330px 940px'}}>
      <VaseSurface light={1 - covered * 0.6}>
        <Sun x={820} y={540} r={110} t={t} />
        {/* rayo de sol sobre Diógenes */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <path d="M760 580 L60 900 L620 1140 Z" fill={V.sun} opacity={0.18 * (1 - covered * 0.8)} />
        </svg>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <Reclining x={120} y={900} s={1.75} wave={wave} />
        </svg>
        <KingShadow x={shadowX} />
        {FRIEZE}
      </VaseSurface>
    </AbsoluteFill>
  );
};

// ---------------- 1) Le dijo a un rey: correte ----------------
export const S1: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const moveF = wordFrame(scene, fps, 'move', 1, 'start', 0.62);
  const sx = interpolate(f, [0, moveF], [SHADOW0, -60], {...clamp, easing: (x) => x});
  const wave = lerp(f, moveF - 2, moveF + 6, 0, 1, outExpo);
  const zoom = 1 + 0.75 * lerp(f, moveF, moveF + 6, 0, 1, outExpo);
  const frozen = f >= moveF;
  return (
    <AbsoluteFill>
      <Frame0 t={frozen ? moveF / fps : t} shadowX={sx} wave={wave} zoom={zoom} />
      <AbsoluteFill style={{background: V.sunHot, opacity: interpolate(f - moveF, [0, 1, 6], [0, 0.6, 0], clamp), mixBlendMode: 'screen'}} />
      {frozen ? <AbsoluteFill style={{background: 'rgba(20,10,5,0.25)'}} /> : null}
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 2) Alejandro Magno: rey a los 20 ----------------
const GREECE: Array<[number, number]> = [
  [380, 520], [430, 500], [480, 520], [520, 560], [560, 560], [600, 600], [640, 620], [610, 660], [560, 650], [540, 700], [580, 760], [560, 800], [520, 790],
  [500, 840], [470, 900], [430, 920], [400, 880], [420, 840], [400, 800], [430, 760], [400, 720], [380, 680], [360, 620],
];
export const S2: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const twF = wordFrame(scene, fps, 'twenty', 1, 'start', 0.35);
  const greeceF = wordFrame(scene, fps, 'greece', 1, 'start', 0.8);
  const spin = Math.cos(t * 2.2);
  const engrave = spring({frame: f - twF, fps, config: {damping: 9, stiffness: 200}});
  const fill = lerp(f, twF, greeceF + 8, 0, 1, (x) => x);
  return (
    <AbsoluteFill>
      <VaseSurface>
        {/* mapa de Grecia que se tiñe del color del ejército */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g transform="translate(-40 400) scale(1.25)">
            <path d={'M' + GREECE.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z'} fill={V.clayDark} stroke={V.black} strokeWidth={4} />
            <clipPath id="greeceClip">
              <path d={'M' + GREECE.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z'} />
            </clipPath>
            <g clipPath="url(#greeceClip)">
              <circle cx={470} cy={560} r={fill * 520} fill={V.black} />
            </g>
            {[[660, 700], [700, 760], [650, 820], [720, 640]].map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={10} fill={fill > 0.6 ? V.black : V.clayDark} stroke={V.black} strokeWidth={3} />
            ))}
          </g>
        </svg>
        {/* medallón con el perfil, girando como una moneda */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(540 760) scale(${0.25 + 0.75 * Math.abs(spin)} 1)`}>
            <circle r={250} fill={V.clayLight} stroke={V.black} strokeWidth={14} />
            <circle r={222} fill="none" stroke={V.black} strokeWidth={4} strokeDasharray="18 10" />
            {spin > 0 ? <AlexProfile x={0} y={10} s={1.05} /> : <AlexProfile x={0} y={10} s={1.05} color="#2A1206" crown={false} />}
          </g>
          {/* el 20 grabado */}
          {f >= twF ? (
            <text x={820} y={1080} textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontWeight={700} fontSize={260} fill={V.sun} stroke={V.black} strokeWidth={10} paintOrder="stroke" transform={`translate(820 1000) scale(${interpolate(engrave, [0, 1], [2.4, 1])}) translate(-820 -1000)`} opacity={Math.min(1, engrave * 2)}>
              20
            </text>
          ) : null}
        </svg>
        {FRIEZE}
      </VaseSurface>
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 3) Diógenes vivía en una tinaja ----------------
export const S3: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const jarF = wordFrame(scene, fps, 'jar', 1, 'start', 0.4);
  const nothF = wordFrame(scene, fps, 'nothing', 1, 'start', 0.8);
  const zoom = lerp(f, 0, dur, 1, 1.25, (x) => x);
  const open = lerp(f, jarF, jarF + 10, 0, 1, outCubic);
  const items = ['CLOAK', 'STAFF', 'BAG', 'CUP'];
  const listP = interpolate(f, [jarF + 6, nothF + 6], [0, items.length + 0.99], clamp);
  return (
    <AbsoluteFill>
      <VaseSurface>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(380 830) scale(${zoom * (0.92 + 0.08 * Math.cos(t * 1.6))} ${zoom})`}>
            <Pithos x={0} y={0} s={1.25} open={open} />
          </g>
        </svg>
        {/* inventario escrito como en una vasija */}
        <div style={{position: 'absolute', left: 700, top: 560, fontFamily: font.serif, fontWeight: 700, fontSize: 52, letterSpacing: '0.12em', color: V.black, lineHeight: 1.5}}>
          {items.map((it, k) => (
            <div key={it} style={{opacity: listP > k ? 1 : 0, textDecoration: k === 3 && f > nothF ? 'line-through' : undefined}}>{it}</div>
          ))}
          <div style={{opacity: f > nothF + 10 ? 1 : 0, fontSize: 64}}>…</div>
        </div>
        {FRIEZE}
      </VaseSurface>
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// Rey de pie (figura negra alta, con corona y capa).
const StandingKing: React.FC<{x: number; y: number; s: number; rim?: number}> = ({x, y, s, rim = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-70 0 C-90 -120 -70 -260 -40 -300 L40 -300 C70 -260 90 -120 70 0 Z" fill={V.black} stroke={V.sun} strokeOpacity={rim} strokeWidth={6} />
    <path d="M-40 -300 C-80 -220 -100 -120 -110 -10 L-70 0" fill={V.black} stroke={V.sun} strokeOpacity={rim} strokeWidth={6} />
    <circle cx={0} cy={-340} r={44} fill={V.black} stroke={V.sun} strokeOpacity={rim} strokeWidth={6} />
    <path d="M-40 -372 L-30 -400 L-12 -378 L0 -408 L12 -378 L30 -400 L40 -372 Z" fill={V.sun} />
    <path d="M40 -240 L120 -200 C130 -196 132 -186 124 -182 L44 -210" fill={V.black} />
    <path d="M-30 -200 L30 -200 M-34 -140 L34 -140" stroke={V.incise} strokeWidth={4} />
  </g>
);

// ---------------- 4) La cita: "correte, que me tapás el sol" ----------------
export const S4: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const sunF = wordFrame(scene, fps, 'sun', 1, 'start', 0.9);
  const burst = lerp(f, sunF, sunF + 10, 0, 1, outExpo);
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith('stand')));
  const tokens = quote.split(/\s+/).filter(Boolean);
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2).map((x) => Math.round(x * fps));
  const offer = lerp(f, 0, 20, 0, 1, outCubic);
  return (
    <AbsoluteFill>
      <VaseSurface light={1 + burst}>
        <Sun x={540} y={780} r={110} burst={burst} t={t} />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <StandingKing x={540} y={1300} s={1.6} rim={burst} />
          {/* el rey le ofrece cualquier cosa (una bolsa de oro) */}
          <g transform={`translate(${740 + (1 - offer) * 100} ${880})`} opacity={1 - burst}>
            <path d="M-40 0 C-60 -60 60 -60 40 0 C30 40 -30 40 -40 0 Z" fill={V.sun} stroke={V.black} strokeWidth={5} />
          </g>
          {/* Diógenes chiquito abajo, mirando para arriba */}
          <Reclining x={120} y={1220} s={0.7} />
        </svg>
        {FRIEZE}
      </VaseSurface>
      <AbsoluteFill style={{background: V.sunHot, opacity: interpolate(f - sunF, [0, 2, 10], [0, 0.85, 0], clamp)}} />
      {/* lo que dice la voz antes de la cita (cero tiempo muerto) */}
      <div style={{position: 'absolute', top: 250, left: 120, width: W - 290, padding: '22px 30px', background: `linear-gradient(180deg, ${V.clayLight}, ${V.clay})`, border: `6px solid ${V.black}`, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 70, lineHeight: 1.05, letterSpacing: '0.04em', textTransform: 'uppercase', color: V.black, opacity: 1 - Math.max(0, Math.min(1, (f - (times[0] ?? 0)) / 6))}}>
        {['The', 'king', 'offered', 'him', 'anything.'].map((w, i) => {
          const at = syncTokens(['The', 'king', 'offered', 'him', 'anything'], scene.words, 1.5)[i] * fps;
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.25em', padding: '0 6px', background: i === 4 ? V.black : undefined, color: i === 4 ? V.sun : V.black, opacity: Math.max(0, Math.min(1, (f - at + 3) / 4))}}>
              {w}
            </span>
          );
        })}
      </div>
      {/* la cita, palabra por palabra (la placa aparece con la primera palabra citada) */}
      <div style={{position: 'absolute', top: 230, left: 70, width: W - 190, display: 'flex', justifyContent: 'center', opacity: Math.max(0, Math.min(1, (f - (times[0] ?? 0) + 4) / 5))}}>
        <div style={{padding: '22px 34px', background: `linear-gradient(180deg, ${V.clayLight}, ${V.clay})`, border: `6px solid ${V.black}`, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 80, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '0.02em'}}>
          {tokens.map((tok, i) => {
            const on = Math.max(0, Math.min(1, (f - (times[i] ?? 0) + 3) / 5));
            const isSun = /sun/i.test(tok);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: '0.22em', opacity: on, transform: `translateY(${(1 - on) * 16}px)`, color: isSun ? V.sunHot : V.black, WebkitTextStroke: isSun ? `4px ${V.black}` : undefined, paintOrder: 'stroke fill', textShadow: isSun ? '0 0 18px rgba(255,200,80,0.9)' : undefined} as React.CSSProperties}>
                {tok}
              </span>
            );
          })}
          <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 28, letterSpacing: '0.3em', color: V.black, marginTop: 10}}>— DIOGENES</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 5) Los guardias se rieron. Alejandro no. ----------------
export const S5: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const didntF = wordFrame(scene, fps, "didn't", 1, 'start', 0.7);
  const cut = f >= didntF;
  const pan = lerp(f, 0, didntF, 0, -260, (x) => x);
  return (
    <AbsoluteFill>
      <VaseSurface tint={cut ? 0.35 : 0}>
        {!cut ? (
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(${pan} 0)`}>
              {Array.from({length: 8}, (_, k) => {
                const laugh = Math.abs(Math.sin(t * 9 + k * 1.3));
                return <Hoplite key={k} x={60 + k * 170} y={700 - laugh * 26} s={1.9} laugh={laugh} />;
              })}
            </g>
          </svg>
        ) : (
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <AlexProfile x={540} y={820} s={2.2} />
            {/* ceño: línea incisa */}
            <path d="M600 610 L700 640" stroke={V.incise} strokeWidth={6} />
          </svg>
        )}
        {FRIEZE}
      </VaseSurface>
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 6) La cita: "si no fuera Alejandro, sería Diógenes" ----------------
export const S6: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase() === 'if'));
  const tokens = quote.split(/\s+/).filter(Boolean);
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2).map((x) => Math.round(x * fps));
  const join = lerp(f, 0, Math.round(dur * 0.7), 0, 1, inOut);
  const crack = lerp(f, dur - 14, dur, 0, 1, outCubic);
  return (
    <AbsoluteFill>
      <VaseSurface>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {/* Alejandro (corona) a la izquierda, Diógenes (sin corona, barba) a la derecha: se acercan y se miran */}
          <AlexProfile x={300 + join * 90} y={900} s={1.2} />
          <g transform={`translate(${780 - join * 90} 900) scale(-1 1)`}>
            <AlexProfile x={0} y={0} s={1.2} crown={false} />
            <path d="M60 60 C80 110 110 130 150 130" stroke={V.incise} strokeWidth={5} fill="none" />
          </g>
          <path d={`M540 560 L540 ${560 + join * 640}`} stroke={V.sun} strokeWidth={6} opacity={join} />
        </svg>
        <Cracks p={crack} cx={540} cy={900} seed={6} />
        {FRIEZE}
      </VaseSurface>
      <div style={{position: 'absolute', top: 230, left: 70, width: W - 190, display: 'flex', justifyContent: 'center', opacity: Math.max(0, Math.min(1, (f - (times[0] ?? 0) + 4) / 5))}}>
        <div style={{padding: '22px 34px', background: `linear-gradient(180deg, ${V.clayLight}, ${V.clay})`, border: `6px solid ${V.black}`, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 74, lineHeight: 1.05, textTransform: 'uppercase'}}>
          {tokens.map((tok, i) => {
            const on = Math.max(0, Math.min(1, (f - (times[i] ?? 0) + 3) / 5));
            const name = /alexander|diogenes/i.test(tok);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: '0.22em', opacity: on, color: name ? V.sunHot : V.black, WebkitTextStroke: name ? `4px ${V.black}` : undefined, paintOrder: 'stroke fill', textShadow: name ? '0 0 16px rgba(255,200,80,0.9)' : undefined} as React.CSSProperties}>
                {tok}
              </span>
            );
          })}
          <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 28, letterSpacing: '0.3em', color: V.black, marginTop: 10}}>— ALEXANDER</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- mundo de hoy, dibujado como vasija, visto por las grietas ----------------
const CrackFrame: React.FC<{children: React.ReactNode; p?: number}> = ({children, p = 1}) => (
  <>
    {children}
    <Cracks p={p} cx={540} cy={800} seed={7} />
  </>
);

const Suit: React.FC<{x: number; y: number; s?: number; sitting?: boolean; tie?: string}> = ({x, y, s = 1, sitting = false, tie = V.sun}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-200} r={36} fill={V.black} />
    <path d={sitting ? 'M-50 -160 L50 -160 L56 -40 L90 -40 L90 60 L70 60 L70 0 L-50 0 Z' : 'M-50 -160 L50 -160 L56 40 L30 40 L24 160 L4 160 L0 40 L-4 40 L-8 160 L-28 160 L-34 40 L-56 40 Z'} fill={V.black} />
    <path d="M0 -160 L-10 -110 L0 -60 L10 -110 Z" fill={tie} />
    <path d="M-30 -150 L0 -120 L30 -150" stroke={V.incise} strokeWidth={3} fill="none" />
  </g>
);

// ---------------- 7) En cualquier negocio, el poder lo tiene el que se puede ir ----------------
export const S7: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const walkF = wordFrame(scene, fps, 'walk', 1, 'start', 0.55);
  const leave = lerp(f, walkF - 4, dur, 0, 1, inOut);
  const arrow = lerp(f, walkF - 2, walkF + 10, 0, 1, outCubic);
  return (
    <AbsoluteFill>
      <VaseSurface>
        <CrackFrame>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            {/* mesa */}
            <rect x={220} y={930} width={640} height={26} fill={V.black} />
            <path d="M260 956 L250 1160 M820 956 L830 1160" stroke={V.black} strokeWidth={14} />
            <Suit x={240} y={980} s={1.1} sitting />
            {/* el que se puede ir: se levanta y se va */}
            <Suit x={780 + leave * 200} y={900 + (1 - Math.min(1, leave * 3)) * 80} s={1.1} sitting={leave < 0.05} />
            {/* silla vacía */}
            <path d={`M${700 - leave * 60} 1060 L${700 - leave * 60} 960 L${760 - leave * 60} 960 M${700 - leave * 60} 1000 L${780 - leave * 60} 1000 L${780 - leave * 60} 1060`} stroke={V.black} strokeWidth={10} fill="none" />
            {/* la flecha del poder pasa al que se levanta */}
            <path d={`M${300 + arrow * 420} 760 L${380 + arrow * 420} 760`} stroke={V.sun} strokeWidth={14} />
            <path d={`M${380 + arrow * 420} 740 L${410 + arrow * 420} 760 L${380 + arrow * 420} 780 Z`} fill={V.sun} />
            <text x={340 + arrow * 420} y={730} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={34} fill={V.black}>POWER</text>
          </svg>
          {f > walkF ? (
            <div style={{position: 'absolute', left: 400, top: 1060, padding: '8px 22px', border: `5px solid ${V.black}`, fontFamily: font.serif, fontWeight: 700, fontSize: 52, letterSpacing: '0.12em', color: V.black, background: V.clayLight}}>BATNA</div>
          ) : null}
        </CrackFrame>
        {FRIEZE}
      </VaseSurface>
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 8) El giro: la plata no te hace libre. Necesitar menos, sí. ----------------
const ICONS = ['$', '%', '31', '↻', '★', '◆'];
export const S8: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const lessF = wordFrame(scene, fps, 'less', 1, 'start', 0.6);
  const cuts = ICONS.map((_, k) => lessF - 6 + k * 3);
  const allCut = f >= cuts[cuts.length - 1] + 4;
  const fall = lerp(f, cuts[cuts.length - 1], dur, 0, 1, outCubic);
  const kick = Math.max(0, ...cuts.map((c) => (f >= c ? Math.max(0, 1 - (f - c) / 4) : 0)));
  return (
    <AbsoluteFill style={{transform: `translate(${Math.sin(f * 3) * kick * 14}px, 0)`}}>
      <VaseSurface light={1 + fall}>
        {allCut ? <Sun x={820} y={600} r={80 * fall} t={t} /> : null}
        <CrackFrame>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            {/* cadenas hechas de íconos que tiran del hombre */}
            {ICONS.map((ic, k) => {
              const a = (k / ICONS.length) * Math.PI * 2 + 0.4;
              const ex = 540 + Math.cos(a) * 470;
              const ey = 820 + Math.sin(a) * 380;
              const cut = f >= cuts[k];
              const sx = 540 + Math.cos(a) * 60;
              const sy = 800 + Math.sin(a) * 90;
              const n = 6;
              return (
                <g key={k} opacity={cut ? Math.max(0, 1 - (f - cuts[k]) / 8) : 1}>
                  {Array.from({length: n}, (_, j) => {
                    const u = j / (n - 1);
                    const drop = cut ? (f - cuts[k]) * 6 * u : 0;
                    return <ellipse key={j} cx={sx + (ex - sx) * u} cy={sy + (ey - sy) * u + drop} rx={22} ry={11} fill="none" stroke={V.black} strokeWidth={7} transform={`rotate(${(a * 180) / Math.PI} ${sx + (ex - sx) * u} ${sy + (ey - sy) * u + drop})`} />;
                  })}
                  <circle cx={ex} cy={ey} r={46} fill={V.black} />
                  <text x={ex} y={ey + 16} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={42} fill={V.sun}>{ic}</text>
                </g>
              );
            })}
            {/* el hombre: de pie y atado → acostado al sol */}
            {allCut ? <Reclining x={330} y={900 + (1 - fall) * -60} s={1.2} /> : <Suit x={540} y={880} s={1.15} />}
          </svg>
        </CrackFrame>
        {FRIEZE}
      </VaseSurface>
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 9) Un ejército contra un rayo de sol ----------------
export const S9: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const sunF = wordFrame(scene, fps, 'sunlight', 1, 'start', 0.8);
  const tilt = lerp(f, 4, sunF, 0, 7, inOut);
  const shine = lerp(f, sunF - 4, sunF + 8, 0, 1, outCubic);
  return (
    <AbsoluteFill>
      <VaseSurface>
        <AbsoluteFill style={{transform: `rotate(${-tilt}deg)`, transformOrigin: '540px 900px'}}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            {/* izquierda: miles de soldados, caballos y oro (todo lo que hay que mantener) */}
            <g transform={`translate(0 ${tilt * 14})`}>
              {Array.from({length: 9}, (_, k) => (
                <Hoplite key={k} x={10 + (k % 5) * 90} y={640 + Math.floor(k / 5) * 170} s={1.05} />
              ))}
              <Rider x={40} y={960} s={1.2} />
              <path d="M40 1210 L460 1210 L420 1160 L360 1150 L300 1170 L220 1140 L140 1170 L80 1160 Z" fill={V.sun} stroke={V.black} strokeWidth={5} />
            </g>
            <line x1={540} y1={520} x2={540} y2={1250} stroke={V.black} strokeWidth={8} />
            {/* derecha: un rayo de sol y un hombre acostado */}
            <path d={`M860 520 L620 1180 L${900 + shine * 60} 1180 Z`} fill={V.sun} opacity={0.35 + shine * 0.4} />
            <Reclining x={600} y={1120} s={1.0} />
          </svg>
        </AbsoluteFill>
        <Sun x={860} y={520} r={60 + shine * 30} t={t} />
        {FRIEZE}
      </VaseSurface>
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 10) No podés comprar ni gobernar a quien no quiere nada ----------------
export const S10: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const ruleF = wordFrame(scene, fps, 'rule', 1, 'start', 0.75);
  const spinA = lerp(f, 0, dur, -6, 6, (x) => x);
  const dust = lerp(f, dur - 14, dur, 0, 1, (x) => x);
  const gifts = Array.from({length: 9}, (_, k) => ({a: (k / 9) * Math.PI * 2 + 0.3, at: 4 + k * 9, kind: k % 3}));
  return (
    <AbsoluteFill>
      <VaseSurface>
        <AbsoluteFill style={{transform: `rotate(${spinA}deg) scale(1.05)`}}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            {/* escudo de luz */}
            <circle cx={540} cy={880} r={250 + Math.sin(t * 4) * 8} fill={V.sun} opacity={0.22} />
            <circle cx={540} cy={880} r={250 + Math.sin(t * 4) * 8} fill="none" stroke={V.sun} strokeWidth={8} opacity={0.8} />
            <Reclining x={390} y={840} s={1.05} />
            {gifts.map((g, k) => {
              const lt = f - g.at;
              if (lt < 0) return null;
              const inP = Math.min(1, lt / 8);
              const r = 620 - inP * 370 + (lt > 8 ? (lt - 8) * 14 : 0);
              const x = 540 + Math.cos(g.a) * r;
              const y = 880 + Math.sin(g.a) * r * 0.85;
              const gone = lt > 8 ? Math.min(1, (lt - 8) / 8) : 0;
              return (
                <g key={k} transform={`translate(${x} ${y}) rotate(${lt * 12})`} opacity={1 - gone}>
                  {g.kind === 0 ? <path d="M-34 0 C-50 -50 50 -50 34 0 C26 34 -26 34 -34 0 Z" fill={V.sun} stroke={V.black} strokeWidth={5} /> : null}
                  {g.kind === 1 ? <path d="M-40 10 L-40 -20 L-24 0 L0 -30 L24 0 L40 -20 L40 10 Z" fill={V.sun} stroke={V.black} strokeWidth={5} /> : null}
                  {g.kind === 2 ? (
                    <g>
                      <rect x={-34} y={-44} width={68} height={88} fill={V.clayLight} stroke={V.black} strokeWidth={5} />
                      <path d="M-22 -24 L22 -24 M-22 -6 L22 -6 M-22 12 L12 12" stroke={V.black} strokeWidth={4} />
                    </g>
                  ) : null}
                  {gone > 0 ? Array.from({length: 6}, (_, j) => <circle key={j} cx={(hash(j + k * 7) - 0.5) * 80 * gone} cy={(hash(j + k * 11) - 0.5) * 80 * gone} r={5} fill={V.sun} />) : null}
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
        {/* el polvo de oro sube y tapa el sol: vuelve la sombra */}
        {dust > 0 ? <div style={{position: 'absolute', inset: 0, background: `linear-gradient(0deg, rgba(10,4,2,${dust * 0.6}), rgba(255,211,107,${dust * 0.25}) 60%, transparent)`}} /> : null}
        {FRIEZE}
      </VaseSurface>
      <AbsoluteFill style={{background: V.sunHot, opacity: interpolate(f - ruleF, [0, 2, 8], [0, 0.4, 0], clamp)}} />
      <Tablet scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 11) Querés menos... incluso a un rey (vuelve la sombra: cuadro 0) ----------------
export const S11: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const back = lerp(f, 0, dur - 1, 0, 1, (x) => 1 - (1 - x) ** 2);
  const sx = SHADOW0 - 900 + back * 900;
  const headOut = lerp(f, dur - 12, dur - 3, 1, 0);
  return (
    <AbsoluteFill>
      <Frame0 t={(f + 1 - dur) / fps} shadowX={sx} />
      <Tablet scene={scene} opacity={headOut} />
    </AbsoluteFill>
  );
};

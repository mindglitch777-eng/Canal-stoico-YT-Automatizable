// Las 11 escenas de "millonario-invisible".
import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash, syncTokens} from '../../director';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, outCubic, outExpo, useLocal, wordFrame} from '../common';
import {accentGreen, accentRed, accentWarm, accentYellow, Chain, Confetti, G, Man, Pickup, Sedan, ShowHeadline, SportsCar, Studio} from './parts';

type P = {scene: Scene; dur: number};

const LX = 280; // centro del de la izquierda
const RX = 760; // centro del de la derecha
const MANY = 460; // arriba de la caja de cada concursante

// ---------------- Cuadro 0 (también es el final del loop) ----------------
export const Frame0: React.FC<{t: number; zoom?: number; zx?: number; count?: number; frozen?: boolean}> = ({t, zoom = 1, zx = 540, count, frozen = false}) => {
  const tt = frozen ? t : t;
  const n = count ?? (t < 1.2 ? 3 : t < 2.4 ? 2 : t < 3.6 ? 1 : 0);
  const led = (Math.floor(((tt % 100) + 100) * 4) % 2 === 0 ? 1 : 0.35);
  return (
    <AbsoluteFill>
      <Studio t={tt} />
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${zx}px 760px`}}>
        {/* autos detrás de cada uno */}
        <div style={{position: 'absolute', left: LX - 260, top: 800}}>
          <SportsCar w={420} />
        </div>
        <div style={{position: 'absolute', left: RX - 150, top: 790}}>
          <Sedan w={340} />
        </div>
        <div style={{position: 'absolute', left: LX - 150, top: MANY}}>
          <Man kind="flashy" label="LEFT" led={led} />
        </div>
        <div style={{position: 'absolute', left: RX - 150, top: MANY}}>
          <Man kind="plain" label="RIGHT" led={1.35 - led} blink={((t % 3) + 3) % 3 > 2.85} />
        </div>
      </AbsoluteFill>
      {/* cuenta regresiva de LED */}
      <div style={{position: 'absolute', left: 540 - 85, top: 600, width: 170, height: 190, borderRadius: 20, background: '#140608', border: `5px solid ${G.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 150, color: n === 0 ? G.red : G.amber, textShadow: `0 0 26px ${n === 0 ? 'rgba(255,40,40,0.9)' : 'rgba(255,178,26,0.9)'}`}}>{n}</div>
    </AbsoluteFill>
  );
};

// ---------------- 1) ¿Quién es el millonario? ----------------
export const S1: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const oneF = wordFrame(scene, fps, 'one', 1, 'start', 0.3);
  const twoF = wordFrame(scene, fps, '2', 1, 'start', 0.5);
  const whichF = wordFrame(scene, fps, 'which', 1, 'end', 0.85);
  // zoom alternado a cada hombre
  const zLeft = lerp(f, oneF, oneF + 6, 0, 1, outCubic) * (1 - lerp(f, twoF, twoF + 6, 0, 1, outCubic));
  const zRight = lerp(f, twoF, twoF + 6, 0, 1, outCubic) * (1 - lerp(f, whichF - 6, whichF, 0, 1, outCubic));
  const zoom = 1 + 0.16 * (zLeft + zRight);
  const zx = zLeft > zRight ? LX : RX;
  const frozen = f >= whichF;
  const count = f < 1.2 * fps ? 3 : f < 2.4 * fps ? 2 : f < whichF ? 1 : 0;
  return (
    <AbsoluteFill>
      <Frame0 t={frozen ? whichF / fps : t} zoom={zoom} zx={zx} count={count} frozen={frozen} />
      <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f - whichF, [0, 1, 6], [0, 0.8, 0], clamp)}} />
      <ShowHeadline scene={scene} accent={(fr) => accentYellow(fr)} />
    </AbsoluteFill>
  );
};

// ---------------- 2) Izquierda: lujo de publicidad. Derecha: un sedán usado. ----------------
const Sparkle: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg width={60} height={60} viewBox="-30 -30 60 60" style={{position: 'absolute', left: x - 30, top: y - 30, transform: `scale(${s})`}}>
    <path d="M0 -28 L6 -6 L28 0 L6 6 L0 28 L-6 6 L-28 0 L-6 -6 Z" fill="#FFF6C0" />
  </svg>
);
const AdItem: React.FC<{at: number; y: number; price: string; children: React.ReactNode}> = ({at, y, price, children}) => {
  const {f, fps, t} = useLocal();
  const s = spring({frame: f - at, fps, config: {damping: 12, stiffness: 150}});
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', left: 40, top: y, width: 460, height: 230, perspective: 900}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotateY(${(1 - s) * 360}deg) scale(${0.4 + 0.6 * s})`}}>{children}</div>
      <div style={{position: 'absolute', right: 0, top: 10, padding: '6px 16px', borderRadius: 10, background: G.yellow, fontFamily: font.sans, fontWeight: 900, fontSize: 34, color: '#3A0A5A', transform: `scale(${s})`}}>{price}</div>
      {[0, 1, 2].map((k) => (
        <Sparkle key={k} x={80 + k * 150} y={40 + (k % 2) * 130} s={Math.abs(Math.sin(t * 5 + k * 2))} />
      ))}
    </div>
  );
};
export const S2: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const sportsF = wordFrame(scene, fps, 'sports', 1, 'start', 0.12);
  const goldF = wordFrame(scene, fps, 'gold', 1, 'start', 0.3);
  const designerF = wordFrame(scene, fps, 'designer', 1, 'start', 0.45);
  const usedF = wordFrame(scene, fps, 'used', 1, 'start', 0.75);
  const puff = Math.max(0, f - usedF) / fps;
  const flicker = f > usedF && Math.floor(f / 3) % 2 === 0 ? 0.55 : 0;
  return (
    <AbsoluteFill>
      <Studio t={t} beams={0.6} />
      {/* izquierda: publicidad de lujo (fondo negro brillante) */}
      <div style={{position: 'absolute', left: 0, top: 380, width: 540, height: 820, background: 'linear-gradient(160deg, #1A1208, #050302 60%, #2A1E08)', borderRight: `3px solid ${G.yellow}`}}>
        <div style={{position: 'absolute', left: -200, top: 0, width: 200, height: 820, background: 'linear-gradient(90deg, transparent, rgba(255,230,150,0.35), transparent)', transform: `translateX(${((t * 500) % 1100)}px) skewX(-20deg)`}} />
      </div>
      <AdItem at={sportsF} y={420} price="$180K">
        <SportsCar w={380} />
      </AdItem>
      <AdItem at={goldF} y={680} price="$25K">
        <svg width={170} height={170} viewBox="0 0 100 100">
          <rect x={38} y={0} width={24} height={100} rx={6} fill="#C99A2E" />
          <circle cx={50} cy={50} r={30} fill="#FFD24D" stroke="#8A6400" strokeWidth={4} />
          <circle cx={50} cy={50} r={22} fill="#102030" />
          <path d="M50 50 L50 34 M50 50 L62 56" stroke="#FFD24D" strokeWidth={3} />
        </svg>
      </AdItem>
      <AdItem at={designerF} y={930} price="$4K">
        <svg width={220} height={160} viewBox="0 0 120 90">
          <path d="M20 30 L100 30 L110 86 L10 86 Z" fill="#2A1A3A" stroke={G.yellow} strokeWidth={3} />
          <path d="M40 30 C40 6 80 6 80 30" fill="none" stroke={G.yellow} strokeWidth={5} />
        </svg>
      </AdItem>
      {/* derecha: el sedán usado, plano fijo y aburrido */}
      <div style={{position: 'absolute', left: 560, top: 380, width: 400, height: 820, background: 'linear-gradient(180deg, #2A2A30, #18181C)'}} />
      <div style={{position: 'absolute', left: 580, top: 760}}>
        <Sedan w={360} />
      </div>
      {f > usedF
        ? [0, 1, 2, 3].map((k) => (
            <div key={k} style={{position: 'absolute', left: 600 - puff * 120 - k * 26, top: 880 - puff * 60 - k * 20, width: 60 + puff * 120 + k * 20, height: 60 + puff * 120 + k * 20, borderRadius: '50%', background: 'rgba(170,170,170,0.5)', opacity: Math.max(0, 1 - puff * 0.8)}} />
          ))
        : null}
      <AbsoluteFill style={{background: '#000', opacity: flicker * 0.6}} />
      <ShowHeadline scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 3) Rayos X a la izquierda: deudas ----------------
const Scanner: React.FC<{y: number; x0: number; x1: number}> = ({y, x0, x1}) => (
  <>
    <div style={{position: 'absolute', left: x0, top: 360, width: x1 - x0, height: 26, borderRadius: 8, background: 'linear-gradient(180deg, #8A96A0, #3A444C)'}} />
    <div style={{position: 'absolute', left: x0, top: y - 6, width: x1 - x0, height: 12, background: G.cyan}} />
    <div style={{position: 'absolute', left: x0, top: y - 70, width: x1 - x0, height: 140, background: 'linear-gradient(180deg, transparent, rgba(89,243,255,0.35), transparent)'}} />
  </>
);
export const S3: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const savedF = wordFrame(scene, fps, 'saved', 1, 'start', 0.8);
  const loanF = wordFrame(scene, fps, 'loan', 1, 'start', 0.4);
  const scanY = interpolate(f, [2, savedF - 4], [380, 1080], {...clamp, easing: inOut});
  const bal = Math.round(-84000 * lerp(f, loanF, savedF, 0, 1, (x) => x));
  const wrong = f >= savedF;
  const xS = spring({frame: f - savedF, fps, config: {damping: 9, stiffness: 220}});
  const wob = wrong ? Math.sin(f * 1.3) * Math.max(0, 1 - (f - savedF) / 20) * 6 : 0;
  return (
    <AbsoluteFill style={{filter: wrong ? `saturate(${1 - Math.min(0.6, (f - savedF) / 20)})` : undefined}}>
      <Studio t={t} dark={0.55} beams={0.3} />
      {/* el de la derecha espera, en sombra */}
      <div style={{position: 'absolute', left: RX - 150, top: MANY, opacity: 0.35}}>
        <Man kind="plain" label="RIGHT" />
      </div>
      {/* el de la izquierda: normal abajo de la franja, rayos X arriba */}
      <div style={{position: 'absolute', left: LX - 150, top: MANY, clipPath: `inset(${Math.max(0, scanY - MANY)}px 0 0 0)`}}>
        <Man kind="flashy" label="LEFT" smile={1} />
      </div>
      <div style={{position: 'absolute', left: LX - 220, top: 360, width: 440, height: Math.max(0, scanY - 360), overflow: 'hidden', background: G.xray}}>
        <div style={{position: 'absolute', left: 70, top: MANY - 360}}>
          <Man kind="flashy" mode="xray" label="LEFT" />
        </div>
      </div>
      {/* cadenas de deuda hacia lo que "tiene" */}
      {scanY > 700 ? (
        <>
          <Chain from={[LX + 20, MANY + 330]} to={[520, 640]} label="CAR LOAN" tension={0.3} color={G.cyan} />
          <Chain from={[LX - 30, MANY + 300]} to={[90, 760]} label="CARD" tension={0.2} color={G.cyan} />
          <Chain from={[LX + 60, MANY + 380]} to={[530, 1010]} label="CARD" tension={0.2} color={G.cyan} />
        </>
      ) : null}
      <Scanner y={scanY} x0={LX - 230} x1={LX + 240} />
      {/* saldo que baja */}
      <div style={{position: 'absolute', left: LX - 200, top: 1090, width: 400, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 74, fontVariantNumeric: 'tabular-nums', ...accentRed(), transform: `translateX(${wob}px)`}}>
        {bal < 0 ? `−$${Math.abs(bal).toLocaleString('en-US')}` : '$0'}
      </div>
      {wrong ? (
        <div style={{position: 'absolute', left: LX - 170, top: 560, width: 340, height: 340, transform: `scale(${interpolate(xS, [0, 1], [2.5, 1])}) rotate(${(1 - xS) * 40}deg)`, opacity: Math.min(1, xS * 2)}}>
          <svg width={340} height={340} viewBox="0 0 100 100">
            <path d="M15 15 L85 85 M85 15 L15 85" stroke={G.red} strokeWidth={16} strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
      <ShowHeadline scene={scene} accent={() => accentRed()} />
    </AbsoluteFill>
  );
};

// ---------------- 4) Rayos X a la derecha: 3 millones ----------------
export const S4: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const milF = wordFrame(scene, fps, 'million', 1, 'start', 0.35);
  const scanY = interpolate(f, [0, Math.round(dur * 0.45)], [380, 1080], {...clamp, easing: inOut});
  const vault = spring({frame: f - 6, fps, config: {damping: 14, stiffness: 90}});
  const money = Math.round(3_000_000 * interpolate(f, [4, milF], [0, 1], {...clamp, easing: (x) => x ** 2}));
  const hit = spring({frame: f - milF, fps, config: {damping: 8, stiffness: 240, mass: 0.6}});
  return (
    <AbsoluteFill>
      <Studio t={t} dark={0.55} beams={0.3} />
      <div style={{position: 'absolute', left: LX - 150, top: MANY, opacity: 0.3, filter: 'grayscale(1)'}}>
        <Man kind="flashy" label="LEFT" />
      </div>
      <div style={{position: 'absolute', left: RX - 150, top: MANY}}>
        <Man kind="plain" label="RIGHT" blink={f % 40 < 3} />
      </div>
      <div style={{position: 'absolute', left: RX - 220, top: 360, width: 440, height: Math.max(0, scanY - 360), overflow: 'hidden', background: G.xray}}>
        <div style={{position: 'absolute', left: 70, top: MANY - 360}}>
          <Man kind="plain" mode="xray" label="RIGHT" />
        </div>
        {/* la bóveda de oro adentro */}
        <svg width={440} height={900} style={{position: 'absolute', left: 0, top: 0}}>
          <g transform={`translate(220 ${MANY - 360 + 360}) scale(${0.3 + vault * 0.9})`}>
            <circle r={120} fill="#3A2A08" stroke="#FFD24D" strokeWidth={14} />
            <circle r={90} fill="none" stroke="#FFE9A0" strokeWidth={4} />
            {Array.from({length: 8}, (_, k) => (
              <line key={k} x1={0} y1={0} x2={Math.cos((k / 8) * Math.PI * 2 + t) * 80} y2={Math.sin((k / 8) * Math.PI * 2 + t) * 80} stroke="#FFD24D" strokeWidth={8} strokeLinecap="round" />
            ))}
            <circle r={22} fill="#FFD24D" />
          </g>
        </svg>
      </div>
      <Scanner y={scanY} x0={RX - 230} x1={RX + 200} />
      <div style={{position: 'absolute', left: 300, top: 1090, width: 700, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 84, fontVariantNumeric: 'tabular-nums', transform: `scale(${f >= milF ? interpolate(hit, [0, 1], [1.6, 1]) : 1})`, ...accentGreen(f)}}>${money.toLocaleString('en-US')}</div>
      <Confetti t={t} t0={milF / fps} gold />
      <ShowHeadline scene={scene} accent={(fr) => accentGreen(fr)} />
    </AbsoluteFill>
  );
};

// ---------------- 5) El estudio: 3 de cada 4 nunca pagaron más de $600 por un traje ----------------
const Suit: React.FC<{price: string; cheap: boolean; on: number; x: number; rise: number}> = ({price, cheap, on, x, rise}) => (
  <div style={{position: 'absolute', left: x - 90, top: 900 - rise * 380, width: 180, height: 300, transform: `scale(${0.5 + rise * 0.6})`}}>
    <svg width={180} height={300} viewBox="0 0 180 300">
      <path d="M90 6 C80 6 80 20 90 22 L90 34" fill="none" stroke="#C9CED6" strokeWidth={5} />
      <path d="M20 60 L90 34 L160 60" fill="none" stroke="#C9CED6" strokeWidth={6} />
      <path d="M30 60 L90 50 L150 60 L160 280 L20 280 Z" fill={cheap ? '#3C4A60' : '#1A1A22'} stroke="#0A0A10" strokeWidth={3} />
      <path d="M90 50 L70 160 L90 280 L110 160 Z" fill="#E8EEF6" />
      <path d="M90 60 L82 150 L90 170 L98 150 Z" fill={cheap ? '#7A2A2A' : '#5A0A3A'} />
    </svg>
    <div style={{position: 'absolute', left: 110, top: 70, padding: '6px 12px', borderRadius: 8, background: cheap && on > 0.5 ? G.green : '#555', fontFamily: font.sans, fontWeight: 900, fontSize: 30, color: '#08120A', boxShadow: cheap && on > 0.5 ? '0 0 24px rgba(77,255,154,0.9)' : undefined}}>{price}</div>
  </div>
);
export const S5: React.FC<P> = ({scene}) => {
  const {f, fps} = useLocal();
  const s3 = wordFrame(scene, fps, '3', 1, 'start', 0.3);
  const s4 = wordFrame(scene, fps, '4', 1, 'start', 0.4);
  const s600 = wordFrame(scene, fps, '600', 1, 'start', 0.8);
  const open = lerp(f, 0, 12, 0, 1, outCubic);
  const rise = lerp(f, 8, s3 + 4, 0, 1, outCubic);
  const lights = [s3, s4, s600];
  const pie = lerp(f, s3, s600 + 4, 0, 0.75, outCubic);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, #3A1A50 0%, #0A0212 75%)'}}>
      {/* el libro abierto, visto desde arriba */}
      <div style={{position: 'absolute', left: 120, top: 760, width: 840, height: 440, perspective: 1200}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 420, height: 440, background: 'linear-gradient(90deg, #E9E2CF, #FFFFFF)', transformOrigin: '100% 50%', transform: `rotateY(${(1 - open) * 80}deg)`, borderRadius: '12px 0 0 12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
          <div style={{padding: '34px 30px', fontFamily: font.serif, fontWeight: 700, fontSize: 40, color: '#2A1A30', lineHeight: 1.1}}>A study of America's millionaires</div>
          {Array.from({length: 6}, (_, k) => (
            <div key={k} style={{margin: '0 30px 16px', height: 8, borderRadius: 4, background: 'rgba(40,20,50,0.18)', width: `${60 + hash(k) * 30}%`}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 420, top: 0, width: 420, height: 440, background: 'linear-gradient(90deg, #FFFFFF, #E9E2CF)', borderRadius: '0 12px 12px 0', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}} />
      </div>
      {['$399', '$450', '$1,500', '$285'].map((p, k) => {
        const cheap = k !== 2;
        const idx = [0, 1, -1, 2][k];
        const on = idx >= 0 && f >= lights[idx] ? 1 : 0;
        return <Suit key={k} price={p} cheap={cheap} on={on} x={200 + k * 220} rise={rise} />;
      })}
      {/* torta 3/4 */}
      <svg width={180} height={180} viewBox="-50 -50 100 100" style={{position: 'absolute', left: 450, top: 980}}>
        <circle r={44} fill="#1A0A26" stroke="#FFFFFF" strokeWidth={3} />
        <path d={`M0 0 L0 -44 A44 44 0 ${pie > 0.5 ? 1 : 0} 1 ${Math.sin(pie * Math.PI * 2) * 44} ${-Math.cos(pie * Math.PI * 2) * 44} Z`} fill={G.green} />
        <text y={10} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={26} fill="#FFFFFF" stroke="#000" strokeWidth={3} paintOrder="stroke">3/4</text>
      </svg>
      {lights.map((lf, k) => (f >= lf && f < lf + 5 ? <AbsoluteFill key={k} style={{background: '#FFFFFF', opacity: (1 - (f - lf) / 5) * 0.25}} /> : null))}
      <ShowHeadline scene={scene} accent={(fr) => accentGreen(fr)} size={78} />
    </AbsoluteFill>
  );
};

// ---------------- 6) Su auto más común: una camioneta común entra derrapando ----------------
export const S6: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const fordF = wordFrame(scene, fps, 'ford', 1, 'start', 0.7);
  const arrive = interpolate(f, [0, fordF], [0, 1], {...clamp, easing: outExpo});
  const x = 1400 - arrive * 860;
  const rot = (1 - arrive) * -14 + Math.sin(arrive * Math.PI) * 6;
  const sc = 0.6 + arrive * 0.95;
  const dark = lerp(f, fordF + 2, fordF + 6, 0, 1, (v) => v);
  return (
    <AbsoluteFill>
      <Studio t={t} dark={dark * 0.9} />
      {/* alfombra roja */}
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, background: '#B0102A', clipPath: 'polygon(46% 56%, 54% 56%, 92% 100%, 8% 100%)', opacity: 1 - dark * 0.6}} />
      {/* polvo */}
      {Array.from({length: 10}, (_, k) => (
        <div key={k} style={{position: 'absolute', left: x + 100 + k * 40 * (1 - arrive) + hash(k) * 60, top: 1050 + hash(k + 4) * 60, width: 80 + k * 10, height: 80 + k * 10, borderRadius: '50%', background: 'rgba(200,180,140,0.35)', opacity: (1 - arrive) * 0.9 + 0.1}} />
      ))}
      <div style={{position: 'absolute', left: x - 300, top: 760, transform: `rotate(${rot}deg) scale(${sc})`, transformOrigin: '50% 80%'}}>
        <Pickup w={600} />
        <div style={{position: 'absolute', left: 30, top: 230, padding: '6px 16px', background: '#F4F1E6', border: '4px solid #1A1A1A', borderRadius: 8, fontFamily: font.sans, fontWeight: 900, fontSize: 30, color: '#1A1A1A', letterSpacing: '0.08em'}}>MILLIONAIRE</div>
      </div>
      {/* faros encendidos cuando se apaga el estudio */}
      {dark > 0 ? <div style={{position: 'absolute', left: x + 120, top: 860, width: 600, height: 300, background: 'radial-gradient(ellipse at 0% 50%, rgba(255,240,180,0.5), transparent 70%)', opacity: dark}} /> : null}
      <ShowHeadline scene={scene} accent={(fr) => accentYellow(fr)} />
    </AbsoluteFill>
  );
};

// ---------------- 7) El giro: verse rico te mantiene pobre (marioneta) ----------------
export const S7: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const poorF = wordFrame(scene, fps, 'poor', 1, 'start', 0.8);
  const yank = spring({frame: f - poorF, fps, config: {damping: 7, stiffness: 260, mass: 0.6}});
  const lift = f >= poorF ? yank * 120 : Math.sin(t * 2) * 8;
  const hands: Array<[number, string]> = [
    [230, 'BANK'],
    [540, 'BRAND'],
    [850, 'LOAN'],
  ];
  const manX = 540;
  const manY = 660 - lift;
  return (
    <AbsoluteFill>
      <Studio t={t} dark={0.92} beams={0} />
      <div style={{position: 'absolute', left: manX - 260, top: 380, width: 520, height: 900, background: 'radial-gradient(ellipse at 50% 30%, rgba(255,240,220,0.22), transparent 70%)'}} />
      {/* hilos */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {hands.map(([hx], k) => {
          const targets: Array<[number, number]> = [
            [manX - 60, manY + 230],
            [manX, manY + 120],
            [manX + 70, manY + 300],
          ];
          const [tx, ty] = targets[k];
          return <line key={k} x1={hx} y1={580} x2={tx} y2={ty} stroke="#EDEDED" strokeWidth={f >= poorF ? 4 : 2.5} opacity={0.9} />;
        })}
      </svg>
      {/* manos gigantes arriba (bancos, marcas, préstamos) */}
      {hands.map(([hx, lbl], k) => (
        <div key={lbl} style={{position: 'absolute', left: hx - 100, top: 460 - (f >= poorF ? yank * 30 : 0), width: 200}}>
          <div style={{margin: '0 auto', width: 150, height: 90, borderRadius: '40px 40px 20px 20px', background: '#E8D2C0', border: '4px solid #3A2A20'}} />
          <div style={{margin: '-8px auto 0', width: 160, height: 46, borderRadius: 8, background: '#1A1A24', border: '3px solid #8A8A9A', fontFamily: font.sans, fontWeight: 900, fontSize: 28, color: '#FFFFFF', textAlign: 'center', lineHeight: '42px'}}>{lbl}</div>
          <div style={{height: 4 + k}} />
        </div>
      ))}
      <div style={{position: 'absolute', left: manX - 150, top: manY, transform: `rotate(${Math.sin(t * 3) * 3}deg)`}}>
        <Man kind="flashy" smile={0.6} />
      </div>
      <ShowHeadline scene={scene} accent={() => accentRed()} lit={0} top={170} size={92} />
    </AbsoluteFill>
  );
};

// ---------------- 8) La cita: barro como si fuera plata ----------------
export const S8: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const tokens = quote.split(/\s+/).filter(Boolean);
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith('earth')));
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2).map((x) => Math.round(x * fps));
  const shine = lerp(f, 0, dur, 0, 1, (x) => x);
  const sweep = ((t * 0.6) % 1) * 200 - 50;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #2A1A12 0%, #070403 75%)'}}>
      {/* platos de plata que se opacan */}
      {[[170, 1010], [910, 1010]].map(([x, y], k) => (
        <div key={k} style={{position: 'absolute', left: x - 120, top: y - 120, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #B9C2CC 40%, #6A747E 75%)', filter: `grayscale(1) brightness(${1 - shine * 0.55}) sepia(${shine * 0.5})`}} />
      ))}
      {/* el plato de barro que brilla como plata */}
      <div style={{position: 'absolute', left: 540 - 260, top: 900 - 260, width: 520, height: 520, borderRadius: '50%', transform: `rotate(${t * 20}deg)`, background: 'radial-gradient(circle at 50% 50%, #B5653A 0%, #9A4E2A 45%, #7A3A1E 55%, #B5653A 58%, #6A2E16 70%, #4A1E0C 72%)', boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 ${80 * shine}px rgba(220,230,255,${0.45 * shine})`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(120deg, transparent ${sweep - 15}%, rgba(235,242,255,${0.75 * shine}) ${sweep}%, transparent ${sweep + 15}%)`}} />
      </div>
      {/* la cita */}
      <div style={{position: 'absolute', top: 210, left: 80, width: W - 220, padding: '30px 40px', borderRadius: 26, background: 'rgba(10,6,4,0.82)', border: '2px solid rgba(255,220,180,0.35)', textAlign: 'center'}}>
        <div style={{fontFamily: font.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 94, lineHeight: 1.05, color: '#F6EBDD'}}>
          {tokens.map((tok, i) => {
            const a = times[i] ?? 0;
            const on = Math.max(0, Math.min(1, (f - a + 3) / 5));
            const silver = /silver/i.test(tok);
            return (
              <span key={i} style={{display: 'inline-block', marginRight: '0.22em', opacity: on, transform: `translateY(${(1 - on) * 20}px)`, color: silver ? '#E6EEFF' : /earthenware/i.test(tok) ? '#E9A070' : undefined, textShadow: silver ? '0 0 20px rgba(220,230,255,0.9)' : '0 4px 12px rgba(0,0,0,0.8)'}}>
                {tok}
              </span>
            );
          })}
        </div>
        <div style={{marginTop: 18, fontFamily: font.sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em', color: '#E9A070'}}>SENECA · LETTERS 5</div>
      </div>
      {/* al final el plato se parte en dos mitades */}
      {f > dur - 8 ? <div style={{position: 'absolute', left: 535, top: 600, width: 10, height: 600, background: '#000', transform: `scaleY(${lerp(f, dur - 8, dur, 0, 1)})`}} /> : null}
    </AbsoluteFill>
  );
};

// ---------------- 9) Uno compró la apariencia. El otro, su libertad. ----------------
export const S9: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const freeF = wordFrame(scene, fps, 'freedom', 1, 'start', 0.75);
  const split = interpolate(f, [4, freeF + 6], [540, 230], {...clamp, easing: inOut});
  const gray = lerp(f, 0, freeF, 0, 1, (x) => x);
  const lid = lerp(f, 2, 14, 0, 1, outCubic);
  return (
    <AbsoluteFill>
      {/* derecha: amanecer de oro, a pescar */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #2A1A3A 0%, #E87A3A 40%, #FFD27A 55%, #3A2A20 56%, #1A1208 100%)'}} />
      <div style={{position: 'absolute', left: 640, top: 760, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6D0, #FFD27A 60%, rgba(255,210,122,0) 72%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform="translate(700 1060)">
          <ellipse cx={0} cy={60} rx={90} ry={16} fill="#120A06" />
          <circle cx={0} cy={-60} r={30} fill="#120A06" />
          <path d="M-30 -30 L30 -30 L40 60 L-40 60 Z" fill="#120A06" />
          <path d="M20 -20 L220 -200" stroke="#120A06" strokeWidth={6} />
          <path d="M220 -200 L230 40" stroke="#120A06" strokeWidth={2} />
        </g>
        {/* la laptop que se cierra */}
        <g transform="translate(600 1120)" opacity={1 - lerp(f, 16, 24, 0, 1)}>
          <rect x={-70} y={0} width={140} height={10} fill="#999" />
          <rect x={-66} y={-90} width={132} height={90} fill="#3A6A9A" transform={`translate(0 0) skewX(0) scale(1 ${1 - lid})`} style={{transformOrigin: '0 0'}} />
        </g>
      </svg>
      {/* izquierda: el lujo se pone gris y se desarma en cuotas */}
      <div style={{position: 'absolute', left: 0, top: 0, width: split, height: H, overflow: 'hidden', background: '#1A1A1E', filter: `grayscale(${gray})`}}>
        <div style={{position: 'absolute', left: 30, top: 760, transform: `rotate(${gray * -8}deg)`}}>
          <SportsCar w={440} gray={gray} />
        </div>
        {Array.from({length: 12}, (_, k) => {
          const d = Math.max(0, t - 0.2 - k * 0.12);
          return (
            <div key={k} style={{position: 'absolute', left: 40 + (k % 4) * 110, top: 980 + Math.floor(k / 4) * 70 + d * d * 600, padding: '6px 12px', borderRadius: 8, background: '#2A2A30', border: '2px solid #777', fontFamily: font.sans, fontWeight: 900, fontSize: 26, color: '#BBB', transform: `rotate(${d * 120 * (k % 2 ? 1 : -1)}deg)`}}>
              {k + 1}/48
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: split - 3, top: 0, width: 6, height: H, background: '#FFF6D0'}} />
      <ShowHeadline scene={scene} accent={() => accentWarm()} lit={0} />
    </AbsoluteFill>
  );
};

// ---------------- 10) La riqueza es invisible (solo la ve el escáner) ----------------
export const S10: React.FC<P> = ({scene, dur}) => {
  const {f} = useLocal();
  const bx = interpolate(f, [4, dur - 8], [-200, W + 200], {...clamp, easing: inOut});
  return (
    <AbsoluteFill style={{background: '#040A10'}}>
      {/* la palabra está ahí, pero solo se ve dentro de la franja del escáner */}
      <div style={{position: 'absolute', left: 0, top: 640, width: W, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 190, color: 'rgba(255,210,77,0.06)'}}>WEALTH</div>
      <div style={{position: 'absolute', left: 0, top: 640, width: W, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 190, color: G.gold, textShadow: '0 0 40px rgba(255,210,77,0.9)', clipPath: `inset(0 ${W - (bx + 140)}px 0 ${bx - 140}px)`}}>WEALTH</div>
      <div style={{position: 'absolute', left: bx - 140, top: 400, width: 280, height: 900, background: 'linear-gradient(90deg, transparent, rgba(89,243,255,0.22), transparent)'}} />
      <div style={{position: 'absolute', left: bx - 4, top: 400, width: 8, height: 900, background: G.cyan}} />
      <ShowHeadline scene={scene} accent={() => accentWarm()} lit={0} />
    </AbsoluteFill>
  );
};

// ---------------- 11) Mirá de nuevo (vuelve el cuadro 0) ----------------
export const S11: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const settle = lerp(f, 0, dur - 8, 0, 1, inOut);
  const headOut = lerp(f, dur - 12, dur - 3, 1, 0);
  const tt = (f + 1 - dur) / fps;
  return (
    <AbsoluteFill>
      <Frame0 t={tt} zoom={1 + (1 - settle) * 0.35} zx={540} count={3} />
      <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f, [0, 1, 6], [0, 0.6, 0], clamp)}} />
      <ShowHeadline scene={scene} accent={(fr) => accentYellow(fr)} opacity={headOut} />
    </AbsoluteFill>
  );
};

// Escenas 4 y 5: el banquete que se "desarma" en pescado muerto y jugo de uva; la túnica que es lana y sangre de caracol.
import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, spring} from 'remotion';
import {hash} from '../../director';
import {Shockwave} from '../../kinetic';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, lerp, OnScreen, outExpo, useLocal, wordFrame} from './util';

type P = {scene: Scene; dur: number};

const Struck: React.FC<{text: string; at: number; x: number; y: number; rot?: number}> = ({text, at, x, y, rot = -6}) => {
  const {f, fps} = useLocal();
  const s = spring({frame: f, fps, config: {damping: 14}});
  const strike = lerp(f, at, at + 6, 0, 1);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
      <div style={{position: 'relative', padding: '14px 34px', border: '3px solid #E8C26A', borderRadius: 8, fontFamily: font.sans, fontWeight: 800, fontSize: 46, letterSpacing: '0.22em', color: '#F3E3B5', background: 'rgba(20,14,6,0.7)', boxShadow: '0 0 30px rgba(232,184,90,0.35)', filter: strike > 0 ? `grayscale(${strike})` : undefined}}>
        {text}
        <div style={{position: 'absolute', left: -14, right: -14, top: '50%', height: 9, background: '#E0402F', boxShadow: '0 0 16px rgba(255,70,50,0.9)', transform: `scaleX(${strike}) rotate(-4deg)`, transformOrigin: '0 50%'}} />
      </div>
    </div>
  );
};

const FISH_BODY = 'M60 150 C140 62 330 52 470 120 C500 134 522 144 534 150 C522 157 500 166 470 180 C330 248 140 238 60 150 Z';
const FISH_TAIL = 'M80 150 L4 84 L30 150 L4 216 Z';

// ---------------- 4) Banquete → pescado muerto; vino fino → jugo de uva ----------------
export const S4Feast: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const deadF = wordFrame(scene, fps, 'dead', 1, 'start', 0.2);
  const fineF = wordFrame(scene, fps, 'fine', 1, 'start', 0.5);
  const grapeF = wordFrame(scene, fps, 'grape', 1, 'start', 0.8);
  const inWine = f >= fineF - 2;
  const rot = drain(f, deadF);
  // pescado: de dorado glaseado a gris
  const die = lerp(f, deadF, deadF + 8, 0, 1, outExpo);
  const bodyTop = interpolateColors(die, [0, 1], ['#F4B54A', '#7D8A8C']);
  const bodyBot = interpolateColors(die, [0, 1], ['#A3561C', '#4C5759']);
  const shine = 1 - die;
  // mosca
  const flyOn = f > deadF + 4;
  const fx = 540 + Math.sin(t * 3.1) * 170 + Math.sin(t * 7.3) * 40;
  const fy = 760 + Math.cos(t * 2.3) * 90 + Math.sin(t * 9.1) * 25;
  // vino
  const level = interpolate(f, [grapeF, grapeF + 18], [0, 1], {...clamp, easing: (x) => x * x});
  const clay = lerp(f, grapeF + 10, grapeF + 20, 0, 1);
  const wobble = Math.sin(t * 5) * 6 * (1 - level * 0.5);
  const swirlOut = lerp(f, dur - 8, dur, 0, 1, (x) => x * x);
  return (
    <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, #2B1A0E 0px, #3A2414 38px, #2E1D10 76px, #24160B 120px)'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,190,110,0.25) 0%, rgba(0,0,0,0.75) 75%)'}} />
      {!inWine ? (
        <AbsoluteFill style={{transform: `rotate(${-4 + t * 2}deg) scale(${1.05 + t * 0.02})`}}>
          {/* plato */}
          <div style={{position: 'absolute', left: W / 2 - 400, top: 780 - 400, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, #F2E6C8 0%, #D9C9A0 55%, #B8954A 57%, #F0D58A 60%, #8E6A28 64%, transparent 66%)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}} />
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="fishG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={bodyTop} />
                <stop offset="1" stopColor={bodyBot} />
              </linearGradient>
            </defs>
            <g transform={`translate(${W / 2 - 290} ${780 - 150 + rot * 8}) rotate(${-8 + rot * 4} 290 150)`}>
              <path d={FISH_TAIL} fill="url(#fishG)" stroke="#2A1C10" strokeWidth={3} />
              <path d={FISH_BODY} fill="url(#fishG)" stroke="#2A1C10" strokeWidth={3} />
              {/* escamas */}
              {Array.from({length: 30}, (_, i) => (
                <path key={i} d={`M${150 + (i % 10) * 30} ${115 + Math.floor(i / 10) * 30} q12 12 0 24`} fill="none" stroke="rgba(40,25,10,0.35)" strokeWidth={2} />
              ))}
              <path d="M410 108 C394 140 394 165 410 192" fill="none" stroke="#2A1C10" strokeWidth={3} />
              <path d="M230 76 C262 26 322 34 352 74" fill={bodyBot} stroke="#2A1C10" strokeWidth={3} />
              <circle cx={455} cy={138} r={15} fill={die > 0.5 ? '#B9C2C0' : '#FFFFFF'} stroke="#2A1C10" strokeWidth={3} />
              <circle cx={457} cy={138} r={die > 0.5 ? 4 : 7} fill="#1A1A1A" />
              {/* glaseado y brillo de lujo */}
              <path d="M150 105 C240 70 360 72 450 112" fill="none" stroke="#FFF3C8" strokeWidth={10} strokeLinecap="round" opacity={0.6 * shine} />
            </g>
            {/* guarnición que desaparece */}
            {Array.from({length: 7}, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return <circle key={i} cx={W / 2 + Math.cos(a) * 300} cy={780 + Math.sin(a) * 300} r={34} fill="#F5E15A" stroke="#C9A62A" strokeWidth={5} opacity={1 - die} />;
            })}
            {/* chispas de lujo */}
            {Array.from({length: 14}, (_, i) => (
              <circle key={`s${i}`} cx={W / 2 - 300 + hash(i) * 600} cy={650 + hash(i + 5) * 280} r={3 + 4 * Math.abs(Math.sin(t * 4 + i))} fill="#FFF6D0" opacity={shine * Math.abs(Math.sin(t * 3 + i))} />
            ))}
            {/* mosca */}
            {flyOn ? (
              <g transform={`translate(${fx} ${fy})`}>
                <ellipse cx={0} cy={0} rx={12} ry={8} fill="#111" />
                <ellipse cx={-6} cy={-10} rx={11} ry={6} fill="rgba(220,230,240,0.7)" transform={`rotate(${Math.sin(f * 2.5) * 30} 0 0)`} />
                <ellipse cx={6} cy={-10} rx={11} ry={6} fill="rgba(220,230,240,0.7)" transform={`rotate(${-Math.sin(f * 2.5) * 30} 0 0)`} />
              </g>
            ) : null}
          </svg>
          <Struck text="FEAST" at={deadF} x={W / 2} y={1170} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{transform: `scale(${1.12 - lerp(f, fineF, dur, 0, 0.1)})`}}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <defs>
              <clipPath id="bowl">
                <path d="M290 430 C290 700 400 790 540 800 C680 790 790 700 790 430 Z" />
              </clipPath>
              <linearGradient id="wine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8E1027" />
                <stop offset="1" stopColor="#3A0410" />
              </linearGradient>
            </defs>
            <g opacity={1 - clay}>
              {/* vino dentro de la copa */}
              <g clipPath="url(#bowl)">
                <rect x={280} y={560 + level * 210 + wobble} width={520} height={400} fill="url(#wine)" />
                <ellipse cx={540} cy={560 + level * 210 + wobble} rx={250 - level * 70} ry={22} fill="#B3243F" />
              </g>
              <path d="M290 430 C290 700 400 790 540 800 C680 790 790 700 790 430 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.75)" strokeWidth={5} />
              <path d="M330 470 C330 640 380 720 440 755" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={10} strokeLinecap="round" />
              <rect x={528} y={800} width={24} height={260} fill="rgba(255,255,255,0.35)" />
              <ellipse cx={540} cy={1070} rx={150} ry={24} fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
            </g>
            {/* vaso de barro con un poco de jugo */}
            <g opacity={clay} transform={`translate(0 ${(1 - clay) * 40})`}>
              <path d="M380 720 C380 900 440 980 540 980 C640 980 700 900 700 720 Z" fill="#9A4E2A" stroke="#4A2312" strokeWidth={6} />
              <path d="M700 760 C780 760 780 880 690 890" fill="none" stroke="#7A3A1E" strokeWidth={18} />
              <ellipse cx={540} cy={720} rx={160} ry={26} fill="#5A2A16" />
              <ellipse cx={540} cy={728} rx={110} ry={14} fill="#6B1A3A" />
              {Array.from({length: 4}, (_, i) => (
                <path key={i} d={`M${400 + i * 14} ${790 + i * 40} q140 20 280 0`} fill="none" stroke="rgba(60,25,10,0.5)" strokeWidth={4} />
              ))}
            </g>
          </svg>
          <Struck text="FINE WINE" at={grapeF} x={W / 2} y={1180} rot={4} />
          <Shockwave at={grapeF + 12} x={W / 2} y={800} size={900} color="rgba(200,60,90,0.8)" />
        </AbsoluteFill>
      )}
      <OnScreen scene={scene} top={250} size={118} />
      {/* el vino gira como remolino y se vuelve tela púrpura */}
      {swirlOut > 0 ? (
        <AbsoluteFill style={{background: `conic-gradient(from ${f * 30}deg at 50% 50%, #3B0A4A, #7B1E8C, #2A0636, #9C2DAE, #3B0A4A)`, opacity: swirlOut, transform: `scale(${0.3 + swirlOut * 1.6}) rotate(${swirlOut * 200}deg)`, borderRadius: `${(1 - swirlOut) * 50}%`}} />
      ) : null}
    </AbsoluteFill>
  );
};

// cuánto se "hunde" el pescado al morir
const drain = (f: number, at: number) => interpolate(f, [at, at + 10], [0, 1], clamp);

// ---------------- 5) Túnica púrpura → lana de oveja + sangre de caracol ----------------
const Sheep: React.FC<{f: number}> = ({f}) => {
  const chew = Math.sin(f * 0.9) * 6;
  const blink = f % 47 < 3 ? 0.1 : 1;
  return (
    <svg width={420} height={340} viewBox="0 0 300 240" style={{overflow: 'visible'}}>
      {[[60, 150], [100, 150], [190, 150], [225, 150]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={18} height={70} rx={8} fill="#2A2420" />
      ))}
      {Array.from({length: 14}, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={145 + Math.cos(a) * 85} cy={110 + Math.sin(a) * 50} r={42} fill="#F4F0E6" stroke="#D8D0C0" strokeWidth={3} />;
      })}
      <ellipse cx={145} cy={110} rx={95} ry={60} fill="#F7F3EA" />
      <g transform={`translate(250 95) rotate(12)`}>
        <ellipse cx={-30} cy={-30} rx={26} ry={11} fill="#2A2420" transform="rotate(-30 -30 -30)" />
        <ellipse cx={30} cy={-30} rx={26} ry={11} fill="#2A2420" transform="rotate(30 30 -30)" />
        <ellipse cx={0} cy={0} rx={36} ry={46} fill="#2A2420" />
        <circle cx={-13} cy={-8} r={9} fill="#FFFFFF" transform={`scale(1 ${blink})`} />
        <circle cx={13} cy={-8} r={9} fill="#FFFFFF" transform={`scale(1 ${blink})`} />
        <circle cx={-11} cy={-6} r={4} fill="#111" />
        <circle cx={15} cy={-6} r={4} fill="#111" />
        <ellipse cx={0} cy={34 + chew * 0.4} rx={18} ry={9} fill="#3A322C" />
        <path d={`M8 ${36 + chew * 0.4} L52 ${20 + chew}`} stroke="#7FB34A" strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
};

const Murex: React.FC = () => (
  <svg width={220} height={220} viewBox="0 0 100 100">
    {Array.from({length: 9}, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return <path key={i} d={`M${50 + Math.cos(a) * 22} ${50 + Math.sin(a) * 30} L${50 + Math.cos(a) * 46} ${50 + Math.sin(a) * 48} L${50 + Math.cos(a + 0.25) * 24} ${50 + Math.sin(a + 0.25) * 32}`} fill="#D9C7A2" stroke="#6B5634" strokeWidth={1.5} />;
    })}
    <ellipse cx={50} cy={50} rx={26} ry={34} fill="#E8D9B8" stroke="#6B5634" strokeWidth={2} />
    <path d="M50 22 C64 34 64 60 50 78 C42 66 40 46 50 22" fill="#B98A5A" />
  </svg>
);

export const S5Robe: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const sheepF = wordFrame(scene, fps, "sheep's", 1, 'start', 0.45);
  const shellF = wordFrame(scene, fps, 'shellfish', 1, 'start', 0.75);
  const bloodF = wordFrame(scene, fps, 'blood', 1, 'start', 0.85);
  const unravel = lerp(f, sheepF - 4, sheepF + 14, 0, 1);
  const sheepIn = spring({frame: f - sheepF - 4, fps, config: {damping: 12, stiffness: 120}});
  const shellIn = spring({frame: f - shellF, fps, config: {damping: 12}});
  const dropY = interpolate(f, [bloodF - 4, bloodF + 6], [470, 980], {...clamp, easing: (x) => x * x});
  const dye = lerp(f, bloodF + 6, bloodF + 22, 0, 1);
  const N = 13;
  const threads = 70;
  const inSwirl = lerp(f, 0, 8, 1, 0);
  const lastDrop = f < bloodF + 6;
  return (
    <AbsoluteFill style={{background: '#12060F'}}>
      {/* Tela púrpura en cámara lenta */}
      {unravel < 1 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 1 - unravel}}>
          <defs>
            {[0, 1].map((k) => (
              <linearGradient key={k} id={`fold${k}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={k ? '#3E0B4C' : '#5C1670'} />
                <stop offset="0.5" stopColor={k ? '#8A2BA0' : '#B04CC6'} />
                <stop offset="1" stopColor={k ? '#3E0B4C' : '#5C1670'} />
              </linearGradient>
            ))}
          </defs>
          {Array.from({length: N}, (_, i) => {
            const w = W / N;
            const pts = Array.from({length: 34}, (_, k) => {
              const y = -40 + k * 62;
              return [i * w + Math.sin(y * 0.004 + t * 1.3 + i * 0.7) * 40 + Math.sin(y * 0.011 + t * 0.7) * 16, y] as const;
            });
            const pts2 = pts.map(([x, y]) => [x + w + 6 + Math.sin(y * 0.006 + t + i) * 10, y] as const).reverse();
            const d = [...pts, ...pts2].map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y}`).join(' ') + 'Z';
            return <path key={i} d={d} fill={`url(#fold${i % 2})`} />;
          })}
          {/* ribete de oro */}
          <rect x={0} y={1500} width={W} height={60} fill="#C8A24A" opacity={0.8} />
        </svg>
      ) : null}
      {/* Se deshilacha en lana */}
      {unravel > 0 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: threads}, (_, i) => {
            const x0 = (i / threads) * W;
            const fall = unravel;
            const col = interpolateColors(fall, [0, 1], ['#8A2BA0', '#F2EEE4']);
            const d = Array.from({length: 18}, (_, k) => {
              const y = k * 115 * (1 - fall * 0.55) + fall * 700 + hash(i) * 80 * fall;
              const x = x0 + Math.sin(k * 0.9 + i + t * 2) * (8 + fall * 60) + (W / 2 - x0) * fall * 0.35;
              return `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(' ');
            return <path key={i} d={d} fill="none" stroke={col} strokeWidth={6 + fall * 4} strokeLinecap="round" opacity={0.9} />;
          })}
          {/* montón de lana + tinte que se expande */}
          {Array.from({length: 22}, (_, i) => (
            <circle key={i} cx={W / 2 - 330 + hash(i + 40) * 660} cy={1040 + hash(i + 70) * 110} r={60 + hash(i) * 40} fill={interpolateColors(dye * Math.max(0, 1 - Math.abs(i - 11) / (2 + dye * 12)), [0, 1], ['#F2EEE4', '#7B1E8C'])} opacity={unravel} />
          ))}
        </svg>
      ) : null}
      {/* Oveja que mastica */}
      <div style={{position: 'absolute', left: W - 430 * sheepIn, top: 700, transform: `rotate(${Math.sin(f * 0.3) * 2}deg)`, opacity: f > sheepF ? 1 : 0}}>
        <Sheep f={f} />
      </div>
      {/* Caracol de mar y la gota de "sangre" */}
      <div style={{position: 'absolute', left: 140, top: 360, transform: `scale(${shellIn}) rotate(${(1 - shellIn) * -90}deg)`, opacity: f > shellF ? 1 : 0}}>
        <Murex />
      </div>
      {f > bloodF - 4 && lastDrop ? (
        <div style={{position: 'absolute', left: 240, top: dropY, width: 34, height: 48, background: 'radial-gradient(circle at 40% 35%, #E25AF0, #6E0F7E)', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}} />
      ) : null}
      <Shockwave at={bloodF + 6} x={260} y={1010} size={1100} color="rgba(170,50,190,0.85)" />
      <OnScreen scene={scene} top={250} size={112} />
      {/* entra desde el remolino de vino */}
      {inSwirl > 0 ? <AbsoluteFill style={{background: '#5C1670', opacity: inSwirl}} /> : null}
      {/* la gota final cae y se vuelve la pantalla de un celular */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #FFFFFF 0%, #8FD1FF 25%, transparent 26%)', opacity: lerp(f, dur - 6, dur, 0, 1), transform: `scale(${lerp(f, dur - 6, dur, 0.1, 4)})`}} />
    </AbsoluteFill>
  );
};

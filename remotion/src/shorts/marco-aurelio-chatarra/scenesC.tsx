// Escenas 6, 7 y 8: el celular que se desarma, la cinta hedónica y la espiral hipnótica de precios.
import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash} from '../../director';
import {Shockwave} from '../../kinetic';
import {color, font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, OnScreen, outExpo, PriceTag, useLocal, wordFrame} from './util';

type P = {scene: Scene; dur: number};

// ---------------- 6) $1,200 = vidrio, metal y un plan de pagos ----------------
const PW = 420;
const PH = 860;
const layer = (bg: string, extra?: React.CSSProperties): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 64,
  background: bg,
  backfaceVisibility: 'hidden',
  ...extra,
});

export const S6Phone: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const glassF = wordFrame(scene, fps, 'glass', 1, 'start', 0.45);
  const metalF = wordFrame(scene, fps, 'metal', 1, 'start', 0.6);
  const payF = wordFrame(scene, fps, 'payment', 1, 'start', 0.8);
  const planF = wordFrame(scene, fps, 'plan', 1, 'start', 0.9);
  const spin = interpolate(f, [0, glassF], [-200, 0], {...clamp, easing: inOut});
  const ex = lerp(f, glassF, glassF + 12, 0, 1, outExpo);
  const view = ex * 1;
  const sweep = ((t * 0.9) % 1) * 160 - 30;
  const contract = interpolate(f, [payF - 2, payF + 16], [0, 1], {...clamp, easing: outExpo});
  const stamp = spring({frame: f - planF, fps, config: {damping: 9, stiffness: 240, mass: 0.6}});
  const labels: Array<[string, number, number]> = [
    ['GLASS', glassF, 3],
    ['METAL', metalF, 1],
    ['CHIPS', metalF + 8, 0],
  ];
  const z = (k: number) => (k - 1.5) * ex * 190;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0E2233 0%, #04070B 70%)'}}>
      {/* brillo de publicidad */}
      <AbsoluteFill style={{background: `linear-gradient(115deg, transparent ${sweep - 10}%, rgba(140,210,255,0.12) ${sweep}%, transparent ${sweep + 10}%)`}} />
      <AbsoluteFill style={{perspective: 1700}}>
        <div
          style={{
            position: 'absolute',
            left: W / 2 - PW / 2,
            top: 700 - PH / 2,
            width: PW,
            height: PH,
            transformStyle: 'preserve-3d',
            transform: `translateY(${-contract * 160}px) scale(${1 - contract * 0.25}) rotateY(${spin + view * -38}deg) rotateX(${view * 18}deg) rotateZ(${view * -6}deg)`,
          }}
        >
          {/* parte de atrás (cuando gira se ve el metal, no la pantalla espejada) */}
          <div style={{...layer('linear-gradient(135deg, #D9DDE2, #7D848C 50%, #C3C8CE)'), transform: `rotateY(180deg) translateZ(${-z(0) + 4}px)`}}>
            <div style={{position: 'absolute', left: 40, top: 40, width: 150, height: 150, borderRadius: 40, background: '#5E656D', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'}} />
          </div>
          {/* placa con chips */}
          <div style={{...layer('linear-gradient(160deg, #0F4A2E, #07301D)'), transform: `translateZ(${z(0)}px)`, border: '2px solid #2B7A50'}}>
            {Array.from({length: 7}, (_, i) => (
              <div key={i} style={{position: 'absolute', left: 50 + (i % 2) * 170, top: 90 + Math.floor(i / 2) * 170, width: 130, height: 110, background: '#1A1A1A', border: '3px solid #C9CED6', borderRadius: 8}} />
            ))}
          </div>
          {/* marco de metal */}
          <div style={{...layer('linear-gradient(135deg, #E7EAEE, #8D949C 45%, #D9DDE2 60%, #6E757D)'), transform: `translateZ(${z(1)}px)`, WebkitMaskImage: 'radial-gradient(closest-side, transparent 92%, #000 93%)'}} />
          <div style={{...layer('transparent'), transform: `translateZ(${z(1)}px)`, border: '16px solid #A7ADB4', boxSizing: 'border-box'}} />
          {/* pantalla encendida */}
          <div style={{...layer('linear-gradient(170deg, #3B6CFF, #8A2BE2 50%, #FF6A3D)'), inset: 16, transform: `translateZ(${z(2)}px)`, boxShadow: `0 0 ${80 + 60 * (1 - ex)}px rgba(120,160,255,0.55)`}}>
            <div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center', fontFamily: font.sans, fontWeight: 300, fontSize: 120, color: 'rgba(255,255,255,0.92)'}}>12:00</div>
          </div>
          {/* vidrio */}
          <div style={{...layer('linear-gradient(130deg, rgba(255,255,255,0.35), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.18) 60%, rgba(255,255,255,0.02))'), transform: `translateZ(${z(3)}px)`, border: '2px solid rgba(255,255,255,0.6)'}} />
          {labels.map(([txt, at, k]) => {
            const s = spring({frame: f - at, fps, config: {damping: 12, stiffness: 200}});
            return (
              <div key={txt} style={{position: 'absolute', left: PW + 40, top: 120 + (3 - k) * 70, transform: `translateZ(${z(k)}px) scale(${s})`, transformOrigin: '0 50%', fontFamily: font.sans, fontWeight: 800, fontSize: 44, letterSpacing: '0.18em', color: '#DDEBFF', whiteSpace: 'nowrap', opacity: f >= at ? 1 : 0, textShadow: '0 0 20px rgba(120,180,255,0.8)'}}>
                ← {txt}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <PriceTag text="$1,200" x={230} y={480} rot={Math.sin(t * 2) * 20} scale={0.8 * (1 - ex * 0.3)} />
      {/* contrato larguísimo que se despliega hasta el piso */}
      <div style={{position: 'absolute', left: 170, top: 520, width: 740, height: 1500 * contract, overflow: 'hidden', background: 'linear-gradient(180deg, #F4EFE3, #E6DECB)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', borderRadius: 4}}>
        <div style={{padding: '40px 50px', fontFamily: font.serif, fontWeight: 700, fontSize: 40, color: '#2A2418'}}>INSTALLMENT AGREEMENT</div>
        {Array.from({length: 40}, (_, i) => (
          <div key={i} style={{margin: '0 50px 16px', height: 9, borderRadius: 4, background: 'rgba(40,36,24,0.25)', width: `${60 + hash(i) * 38}%`}} />
        ))}
      </div>
      {f >= planF ? (
        <div style={{position: 'absolute', left: W / 2, top: 880, transform: `translate(-50%,-50%) rotate(-12deg) scale(${interpolate(stamp, [0, 1], [3, 1])})`, padding: '20px 40px', border: '10px solid #D0312D', borderRadius: 14, fontFamily: font.sans, fontWeight: 900, fontSize: 96, color: '#D0312D', letterSpacing: '0.04em', whiteSpace: 'nowrap', opacity: Math.min(1, stamp * 2), mixBlendMode: 'multiply'}}>
          24 PAYMENTS
        </div>
      ) : null}
      <Shockwave at={planF} x={W / 2} y={880} size={1100} color="rgba(220,60,50,0.8)" />
      <OnScreen scene={scene} top={240} size={108} />
      {/* el contrato se enrolla y se vuelve una cinta de correr */}
      <AbsoluteFill style={{background: '#0B0906', opacity: lerp(f, dur - 5, dur, 0, 1)}} />
    </AbsoluteFill>
  );
};

// ---------------- 7) La cinta hedónica ----------------
const ItemIcon: React.FC<{kind: number}> = ({kind}) => {
  const st = {fill: 'url(#itemGold)', stroke: '#6B4E17', strokeWidth: 3};
  return (
    <svg width={190} height={190} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="itemGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset="0.5" stopColor="#E0B04F" />
          <stop offset="1" stopColor="#8A6420" />
        </linearGradient>
      </defs>
      {kind === 0 ? (
        <g>
          <rect x={38} y={6} width={24} height={88} rx={6} {...st} />
          <circle cx={50} cy={50} r={28} {...st} />
          <circle cx={50} cy={50} r={21} fill="#141008" />
          <path d="M50 50 L50 34 M50 50 L61 56" stroke="#E0B04F" strokeWidth={3} />
        </g>
      ) : kind === 1 ? (
        <g>
          <path d="M8 66 L18 46 C24 36 34 32 46 32 L64 32 C74 32 80 38 86 46 L94 54 L94 70 L8 70 Z" {...st} />
          <circle cx={28} cy={72} r={11} fill="#1A1A1A" stroke="#888" strokeWidth={3} />
          <circle cx={76} cy={72} r={11} fill="#1A1A1A" stroke="#888" strokeWidth={3} />
          <path d="M30 46 L44 38 L60 38 L72 48 Z" fill="#9CC9E8" />
        </g>
      ) : (
        <g>
          <rect x={30} y={6} width={40} height={88} rx={8} {...st} />
          <rect x={35} y={14} width={30} height={68} rx={3} fill="#5B7CFF" />
        </g>
      )}
    </svg>
  );
};

export const S7Treadmill: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const hits = ['upgrade', 'fades', 'normal'].map((w, i) => wordFrame(scene, fps, w, 1, 'start', 0.55 + i * 0.12));
  const speed = 1 + (f / dur) * 3.5;
  const phase = t * 7 * (0.6 + (f / dur) * 1.6);
  const belt = (t * 600 * speed) % 80;
  const shake = (f / dur) ** 2 * 18;
  const sx = Math.sin(f * 2.1) * shake;
  const sy = Math.cos(f * 2.9) * shake * 0.6;
  const runnerX = 380;
  const legA = Math.sin(phase) * 38;
  const legB = -legA;
  const armA = -legA * 0.8;
  const spiralOut = lerp(f, dur - 8, dur, 0, 1, (x) => x * x);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #120E08 0%, #1E160B 60%, #0A0805 100%)'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) rotate(${spiralOut * 300}deg) scale(${1 - spiralOut * 0.7})`, opacity: 1 - spiralOut * 0.6}}>
        {/* cinta dorada */}
        <div style={{position: 'absolute', left: 90, top: 1020, width: 900, height: 60, borderRadius: 30, background: `repeating-linear-gradient(90deg, #3A2C14 0px, #3A2C14 40px, #6B5226 40px, #6B5226 80px)`, backgroundPosition: `${-belt}px 0`, border: '6px solid #C8A24A', boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(232,184,90,0.25)'}} />
        <div style={{position: 'absolute', left: 140, top: 1080, width: 30, height: 140, background: '#8A6420'}} />
        <div style={{position: 'absolute', left: 900, top: 1080, width: 30, height: 140, background: '#8A6420'}} />
        <div style={{position: 'absolute', left: 140, top: 640, width: 18, height: 400, background: '#C8A24A', transform: 'rotate(-12deg)', transformOrigin: '50% 100%'}} />
        {/* corredor */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(${runnerX} ${720 + Math.abs(Math.sin(phase)) * -12})`} stroke="#EFE8D8" strokeWidth={26} strokeLinecap="round" fill="none">
            <circle cx={20} cy={-40} r={34} fill="#EFE8D8" stroke="none" />
            <path d="M14 0 L0 150" />
            <path d={`M0 150 L${Math.sin((legA * Math.PI) / 180) * 120} ${150 + Math.cos((legA * Math.PI) / 180) * 120} l${legA > 0 ? 30 : -10} 10`} />
            <path d={`M0 150 L${Math.sin((legB * Math.PI) / 180) * 120} ${150 + Math.cos((legB * Math.PI) / 180) * 120} l${legB > 0 ? 30 : -10} 10`} />
            <path d={`M10 30 L${Math.sin((armA * Math.PI) / 180) * 90 + 10} ${30 + Math.cos((armA * Math.PI) / 180) * 90}`} />
            <path d={`M10 30 L${Math.sin((-armA * Math.PI) / 180) * 90 + 10} ${30 + Math.cos((-armA * Math.PI) / 180) * 90}`} />
          </g>
        </svg>
        {/* compras que llegan brillando y se apagan al alcanzarlas */}
        {hits.map((hf, i) => {
          const appear = hf - 22;
          const x = interpolate(f, [appear, hf], [1150, runnerX + 120], {...clamp, easing: inOut});
          const gray = lerp(f, hf, hf + 6, 0, 1);
          const s = 1 - lerp(f, hf + 6, hf + 16, 0, 0.6);
          if (f < appear) return null;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: 760 - i * 10, transform: `scale(${s})`, filter: `grayscale(${gray}) brightness(${1 - gray * 0.45}) drop-shadow(0 0 ${30 * (1 - gray)}px rgba(255,210,120,0.9))`, opacity: 1 - lerp(f, hf + 12, hf + 18, 0, 1)}}>
              <ItemIcon kind={i} />
              <div style={{textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 34, letterSpacing: '0.2em', color: gray > 0.5 ? '#777' : '#FFE08A'}}>{gray > 0.5 ? 'NORMAL' : 'NEW!'}</div>
            </div>
          );
        })}
        {/* líneas de velocidad */}
        {Array.from({length: 14}, (_, i) => {
          const y = 300 + hash(i) * 1100;
          const x = ((-t * 1400 * speed * (0.5 + hash(i + 3)) + hash(i + 7) * 2000) % 1400) + 1200;
          return <div key={i} style={{position: 'absolute', left: x - 400, top: y, width: 200 + hash(i) * 200, height: 3, background: 'rgba(232,184,90,0.35)'}} />;
        })}
      </AbsoluteFill>
      <OnScreen scene={scene} top={250} size={112} />
    </AbsoluteFill>
  );
};

// ---------------- 8) No estás quebrado. Estás hipnotizado. ----------------
const TAGS = ['$99', 'SALE', '$1,200', '-50%', '$5,000', 'NEW', '$49.99', 'LIMITED', '$799', 'BUY NOW'];
export const Spiral: React.FC<{rot: number; zoom: number; f: number}> = ({rot, zoom, f}) => (
  <AbsoluteFill style={{transform: `scale(${zoom})`, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `repeating-conic-gradient(from ${rot * 1.4}deg at 50% 48%, #1A0F05 0deg 12deg, #3D2A0E 12deg 24deg)`}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 48%, rgba(255,210,120,0.6) 0%, transparent 18%, transparent 60%, rgba(0,0,0,0.8) 100%)'}} />
    {Array.from({length: 3}, (_, arm) =>
      Array.from({length: 12}, (_, k) => {
        const a = ((rot + arm * 120 + k * 30) * Math.PI) / 180;
        const r = 60 + k * 62;
        const label = TAGS[(arm * 12 + k) % TAGS.length];
        return (
          <div key={`${arm}-${k}`} style={{position: 'absolute', left: W / 2 + Math.cos(a) * r, top: H * 0.48 + Math.sin(a) * r, transform: `translate(-50%,-50%) rotate(${(a * 180) / Math.PI + 90}deg) scale(${0.4 + k * 0.09})`, padding: '8px 22px', background: k % 3 === 0 ? '#D0312D' : '#F4EFE3', color: k % 3 === 0 ? '#FFF' : '#2A1E0C', fontFamily: font.sans, fontWeight: 900, fontSize: 40, borderRadius: 8, whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgba(0,0,0,0.5)'}}>
            {label}
          </div>
        );
      }),
    )}
    <div style={{position: 'absolute', left: W / 2 - 4, top: H * 0.48 - 4, width: 8, height: 8, borderRadius: '50%', background: '#FFF', boxShadow: `0 0 ${40 + Math.sin(f) * 10}px 20px rgba(255,230,170,0.8)`}} />
  </AbsoluteFill>
);

export const spiralRot = (t: number) => t * 160;

export const S8Spiral: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const snapF = wordFrame(scene, fps, 'hypnotized', 1, 'end', 0.85);
  const frozen = f >= snapF;
  const tt = frozen ? snapF / fps : t;
  const zoom = 1 + (tt / (dur / fps)) * 0.6;
  const inF = lerp(f, 0, 8, 1, 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: frozen ? 'grayscale(0.7) contrast(1.3)' : `hue-rotate(${Math.sin(t * 3) * 10}deg)`}}>
        <Spiral rot={spiralRot(tt)} zoom={zoom} f={frozen ? snapF : f} />
      </AbsoluteFill>
      <OnScreen scene={scene} top={250} size={128} />
      {/* chasquido: destello y todo se congela */}
      <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f - snapF, [0, 1, 4], [0, 0.85, 0], clamp)}} />
      {inF > 0 ? <AbsoluteFill style={{background: '#0B0906', opacity: inF}} /> : null}
      {frozen ? <div style={{position: 'absolute', top: 1060, width: W, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 40, letterSpacing: '0.6em', color: color.ink, opacity: 0.8}}>❚❚</div> : null}
    </AbsoluteFill>
  );
};

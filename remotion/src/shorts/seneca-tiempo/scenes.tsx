// Las 10 escenas de "seneca-tiempo".
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash, rng, syncTokens} from '../../director';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, outCubic, outExpo, useLocal, wordFrame} from '../common';
import {alertRed, Bill, C, GlitchBars, Hand, Headline, Notif, Person, Phone, PixelHourglass, SandStream, ScreenFX, timeGold} from './parts';

type P = {scene: Scene; dur: number};

// ---------------- Cuadro 0 (también es el final del loop) ----------------
// t = segundos desde el arranque del video (negativo en el final: empalma sin saltos).
export const Frame0: React.FC<{t: number; splitX?: number}> = ({t, splitX = 540}) => {
  const yank = t <= 0 ? 0 : outExpo(Math.min(1, t / 0.32));
  const billX = 420 - 250 * yank;
  const wallet = t <= 0.3 ? 0 : outCubic(Math.min(1, (t - 0.3) / 0.16));
  const pulse = 1 + 0.06 * Math.sin(t * 9);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: 'translateY(150px)'}}>
      {/* izquierda: le arranca el billete al extraño */}
      <div style={{position: 'absolute', left: 0, top: 0, width: splitX, height: H, overflow: 'hidden', background: 'radial-gradient(ellipse at 40% 42%, #0E1828 0%, #03060B 70%)'}}>
        <Hand x={560 - yank * 40} y={790} scale={0.95} flip open rot={-6} />
        {wallet < 1 ? <Bill x={billX} y={760} w={330} rot={-4 - yank * 10} /> : null}
        <Hand x={billX - 175} y={800} scale={0.85} open={false} rot={4} />
        {wallet > 0 ? (
          <div style={{position: 'absolute', left: 60, top: 700, width: 220, height: 130, perspective: 600}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: 'linear-gradient(135deg, #3A2B20, #1A120C)', border: '3px solid #5A4433'}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: 'linear-gradient(135deg, #4A372A, #22170F)', border: '3px solid #6A5040', transformOrigin: '50% 0%', transform: `rotateX(${(1 - wallet) * 150}deg)`}} />
          </div>
        ) : null}
        <div style={{position: 'absolute', left: 60, top: 1040, fontFamily: font.sans, fontWeight: 900, fontSize: 40, letterSpacing: '0.2em', color: 'rgba(234,246,255,0.5)'}}>$100</div>
      </div>
      {/* derecha: el celular le chupa la arena de oro del pecho */}
      <div style={{position: 'absolute', left: splitX, top: 0, width: W - splitX, height: H, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -splitX, top: 0, width: W, height: H, background: 'radial-gradient(ellipse at 75% 38%, #0C2350 0%, #03060B 65%)'}}>
          <Person x={650} y={1160} scale={0.78} lightAmt={0.9} />
          <Phone x={830} y={620} w={240} glow={pulse} screen={<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% ${60 - 10 * Math.sin(t * 4)}%, rgba(255,210,120,0.5) 0%, transparent 40%)`}} />} />
          <SandStream from={[735, 1110]} to={[830, 640]} bend={-120} t={t} n={44} speed={1.1} />
          <div style={{position: 'absolute', left: 700, top: 1040, fontFamily: font.sans, fontWeight: 900, fontSize: 40, letterSpacing: '0.2em', color: 'rgba(255,194,74,0.7)'}}>3 HRS</div>
        </div>
      </div>
      {/* línea de corte de la pantalla partida */}
      {splitX > 2 && splitX < W - 2 ? <div style={{position: 'absolute', left: splitX - 2, top: 0, width: 4, height: H, background: 'linear-gradient(180deg, transparent, rgba(127,227,255,0.8), transparent)'}} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- 1) $100? No. 3 horas? Claro. ----------------
export const S1: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const threeF = wordFrame(scene, fps, '3', 1, 'start', 0.7);
  const wipe = interpolate(f, [threeF, threeF + 9], [540, 0], {...clamp, easing: inOut});
  const glitch = Math.max(0, 1 - Math.abs(f - threeF - 4) / 6);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${glitch * (hash(f) - 0.5) * 30}px)`}}>
        <Frame0 t={t} splitX={wipe} />
      </div>
      <GlitchBars f={f} amount={glitch} seed={1} />
      <Headline scene={scene} accent={(fr, i) => (i === 1 ? alertRed() : timeGold(fr, i))} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 2) Más de 3 horas por día (desde adentro del celular) ----------------
const Crowd: React.FC<{t: number}> = ({t}) => (
  <>
    {Array.from({length: 7}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${Math.sin(t * 0.8 + i) * 6}px)`}}>
        <Person x={120 + i * 128} y={1440} scale={0.36 + (i % 2) * 0.05} lightAmt={0.7 + 0.3 * Math.sin(t * 3 + i)} />
      </div>
    ))}
  </>
);
export const S2: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const p = lerp(f, 0, dur, 0.05, 0.75, (x) => x);
  const hours = interpolate(f, [0, dur * 0.75], [0, 3 * 3600 + 7 * 60], {...clamp, easing: (x) => x ** 1.6});
  const hh = Math.floor(hours / 3600);
  const mm = Math.floor((hours % 3600) / 60);
  const ss = Math.floor(hours % 60);
  const push = lerp(f, 0, dur, 1.12, 1, (x) => x);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* la cara del usuario, del otro lado del vidrio */}
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #10315E 0%, #040A16 60%)'}} />
        <Person x={600} y={1350} scale={2.4} lightAmt={1} flip />
        <Crowd t={t} />
      </AbsoluteFill>
      {/* interfaz del celular (estamos adentro de la pantalla) */}
      <div style={{position: 'absolute', left: 40, top: 40, right: 40, bottom: 40, borderRadius: 80, border: '6px solid rgba(127,227,255,0.35)'}} />
      <div style={{position: 'absolute', top: 64, left: 110, right: 150, display: 'flex', justifyContent: 'space-between', fontFamily: font.sans, fontWeight: 800, fontSize: 34, color: C.ice}}>
        <span>{`${String(9 + hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`}</span>
        <span>▮▮▮ 12%</span>
      </div>
      <PixelHourglass x={W / 2 - 40} y={780} cell={20} p={p} t={t} />
      <div style={{position: 'absolute', top: 1090, left: 0, width: W - 120, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 92, fontVariantNumeric: 'tabular-nums', ...timeGold(f, 0)}}>
        {`${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`}
      </div>
      <Headline scene={scene} />
      <GlitchBars f={f} amount={Math.max(0, 1 - f / 5)} seed={2} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 3) 186 notificaciones como balas ----------------
export const S3: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const nF = wordFrame(scene, fps, '186', 1, 'start', 0.55);
  const n = Math.round(interpolate(f, [0, nF], [0, 186], {...clamp, easing: (x) => x ** 1.5}));
  const shots = useMemo(() => {
    const r = rng(33);
    return Array.from({length: 34}, (_, k) => ({at: Math.round(2 + (k / 34) ** 0.8 * (dur * 0.8)), x: 330 + r() * 360, y: 560 + r() * 520, rot: (r() - 0.5) * 50, from: r()}));
  }, [dur]);
  const lastHit = [...shots].reverse().find((s) => s.at <= f);
  const kick = lastHit ? Math.max(0, 1 - (f - lastHit.at) / 5) : 0;
  const zoom = f >= nF ? 1 + 0.25 * Math.max(0, 1 - (f - nF) / 10) : 1;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, #0A1A36 0%, #02050A 70%)'}}>
      <AbsoluteFill style={{transform: `translate(${Math.sin(f * 2.3) * kick * 18}px, ${Math.cos(f * 3.1) * kick * 12}px)`}}>
        <Person x={540} y={1300} scale={1.5} lightAmt={0.8 + kick * 0.5} />
        {shots.map((s, k) => {
          if (f < s.at - 6) return null;
          const fly = interpolate(f, [s.at - 6, s.at], [0, 1], {...clamp, easing: (x) => x * x});
          const sx = W + 300 - (W + 300 - s.x) * fly;
          const sy = -200 + (s.y + 200) * fly;
          return (
            <div key={k} style={{position: 'absolute', left: sx - 150, top: sy - 40, transform: `rotate(${s.rot + (1 - fly) * 30}deg) scale(${0.62})`, transformOrigin: '0 50%'}}>
              <Notif i={k} w={420} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* destello de cada impacto */}
      <AbsoluteFill style={{background: '#BFE4FF', opacity: kick * 0.18, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', top: 880, width: W - 120, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 190, lineHeight: 1, transform: `scale(${zoom})`, ...alertRed()}}>{n}</div>
      <Headline scene={scene} accent={() => alertRed()} />
      <GlitchBars f={f} amount={kick * 0.6} seed={3} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 4) 45 días por año. Se van. (el calendario se prende fuego) ----------------
export const S4: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const goneF = wordFrame(scene, fps, 'gone', 1, 'start', 0.75);
  const cols = 19;
  const rows = 20;
  const cell = 42;
  const x0 = (W - 120 - cols * cell) / 2 + 10;
  const y0 = 470;
  const order = useMemo(() => {
    const r = rng(44);
    const idx = Array.from({length: 365}, (_, k) => k);
    for (let k = idx.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1));
      [idx[k], idx[j]] = [idx[j], idx[k]];
    }
    return new Map(idx.slice(0, 45).map((v, k) => [v, k]));
  }, []);
  const blackN = interpolate(f, [2, goneF - 2], [0, 45], clamp);
  const burn = lerp(f, goneF, dur, 0, 1, (x) => x);
  const burnY = y0 + rows * cell * (1 - burn * 1.15);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="fireG" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FFD27A" />
            <stop offset="0.4" stopColor="#FF7A2A" />
            <stop offset="1" stopColor="#FF3B1C" stopOpacity={0} />
          </linearGradient>
        </defs>
        {Array.from({length: 365}, (_, k) => {
          const c = k % cols;
          const r = Math.floor(k / cols);
          const x = x0 + c * cell;
          const y = y0 + r * cell;
          const o = order.get(k);
          const black = o !== undefined && o < blackN;
          // los días negros vuelan hacia el celular de abajo
          const fly = black ? Math.min(1, (blackN - (o as number)) / 6) : 0;
          const fx = x + (W / 2 - 60 - x) * fly;
          const fy = y + (1330 - y) * fly;
          const burnt = y + cell > burnY;
          if (burnt) return null;
          return <rect key={k} x={black ? fx : x} y={black ? fy : y} width={cell - 6} height={cell - 6} rx={6} fill={black ? '#000' : 'rgba(234,246,255,0.12)'} stroke={black ? C.red : 'rgba(127,227,255,0.35)'} strokeWidth={2} opacity={black ? 1 - fly * 0.6 : 1} />;
        })}
        {/* el fuego sube y se come el calendario */}
        {burn > 0
          ? Array.from({length: 26}, (_, k) => {
              const x = x0 - 20 + k * ((cols * cell + 40) / 25);
              const hgt = 70 + 60 * Math.abs(Math.sin(t * 9 + k * 1.7)) + hash(k) * 40;
              return <path key={k} d={`M${x - 26} ${burnY + 10} Q${x} ${burnY - hgt} ${x + 26} ${burnY + 10} Z`} fill="url(#fireG)" />;
            })
          : null}
        {burn > 0 ? <rect x={x0 - 20} y={burnY} width={cols * cell + 40} height={rows * cell} fill="rgba(20,8,2,0.85)" /> : null}
      </svg>
      <div style={{position: 'absolute', top: 400, left: x0, fontFamily: font.sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em', color: 'rgba(234,246,255,0.6)'}}>365 DAYS</div>
      <Phone x={W / 2 - 60} y={1360} w={130} />
      <AbsoluteFill style={{background: '#FF8A3D', opacity: Math.max(0, 1 - Math.abs(f - goneF) / 4) * 0.35, mixBlendMode: 'screen'}} />
      <Headline scene={scene} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 5) 6 años de tu vida. Scrolleados. ----------------
const STAGES = ['0', '10', '20', '30', '40', '50'];
export const S5: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const sixF = wordFrame(scene, fps, '6', 1, 'start', 0.45);
  const scrollF = wordFrame(scene, fps, 'scrolled', 1, 'start', 0.82);
  const travel = lerp(f, 0, sixF + 6, 0, 1, inOut);
  const lineY = 980;
  const x0 = 90;
  const x1 = 900;
  const segA = x0 + (x1 - x0) * 0.58;
  const segB = segA + (x1 - x0) * 0.12;
  const drag = lerp(f, sixF + 4, scrollF, 0, 1, outCubic);
  const feed = lerp(f, scrollF, dur, 0, 1, (x) => x * x);
  const age = lerp(f, 0, dur, 0, 1, (x) => x);
  const walkerX = x0 + travel * (segA - x0 - 40);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0A1630 0%, #02050A 70%)'}}>
      <AbsoluteFill style={{transform: `translateY(${-feed * 1500}px)`}}>
        {/* la línea de la vida, año por año */}
        <div style={{position: 'absolute', left: x0, top: lineY, width: x1 - x0, height: 14, borderRadius: 7, background: 'rgba(127,227,255,0.55)'}} />
        {Array.from({length: 51}, (_, k) => (
          <div key={k} style={{position: 'absolute', left: x0 + ((x1 - x0) * k) / 50 - 2, top: lineY - (k % 10 === 0 ? 30 : 14), width: 4, height: k % 10 === 0 ? 30 : 14, background: 'rgba(127,227,255,0.6)'}} />
        ))}
        {STAGES.map((st, k) => (
          <div key={st} style={{position: 'absolute', left: x0 + ((x1 - x0) * k) / 5 - 50, top: lineY + 34, width: 100, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 46, color: C.ice}}>
            {st}
          </div>
        ))}
        <div style={{position: 'absolute', left: x0, top: lineY + 100, fontFamily: font.sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em', color: 'rgba(234,246,255,0.55)'}}>YEARS OF YOUR LIFE</div>
        {/* 6 años de oro que se van como un post del feed */}
        <div style={{position: 'absolute', left: segA - drag * 120, top: lineY - 14 - drag * 420, width: segB - segA + drag * 240, height: 42 + drag * 170, borderRadius: 16, background: `linear-gradient(180deg, ${C.goldHot}, ${C.gold})`, boxShadow: `0 0 ${30 + drag * 50}px rgba(255,190,70,0.85)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 30 + drag * 50, color: '#2A1A02', overflow: 'hidden', whiteSpace: 'nowrap'}}>
          6 YEARS
        </div>
        {f > sixF ? (
          <div style={{position: 'absolute', left: segA + (segB - segA) / 2 - 60, top: lineY - 60 - drag * 420, width: 120, height: 120, borderRadius: '50%', border: '7px solid rgba(234,246,255,0.85)', background: 'rgba(234,246,255,0.18)'}} />
        ) : null}
        {/* el personaje envejece caminando por su vida, mirando la pantalla */}
        <Person x={walkerX + 70} y={lineY - 10} scale={0.95 - age * 0.06} lightAmt={1} gray={age} />
        <Phone x={walkerX + 250} y={lineY - 300} w={110} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 140, top: 1900 - feed * 1500, width: W - 400, height: 900, borderRadius: 20, background: 'linear-gradient(180deg, #D9C08A, #B8955A)'}} />
      <div style={{opacity: 1 - feed * 2}}>
        <Headline scene={scene} />
      </div>
      <GlitchBars f={f} amount={feed} seed={5} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 6) La cita: pergamino que se desenrolla con tinta de oro ----------------
const Purse: React.FC<{squeeze: number; t: number}> = ({squeeze, t}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(230 1300) scale(${1 - squeeze * 0.06} ${1 + squeeze * 0.04})`}>
      <path d="M-120 0 C-150 -90 -90 -160 0 -160 C90 -160 150 -90 120 0 C100 60 -100 60 -120 0 Z" fill="#5A3A1E" stroke="#2A1A0A" strokeWidth={6} />
      <path d="M-50 -160 C-30 -190 30 -190 50 -160" fill="none" stroke="#C9A060" strokeWidth={10} />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={-40 + k * 40} cy={-150 - k * 6} r={18} fill="#E0B04F" stroke="#7A5214" strokeWidth={4} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 3 + k))} />
      ))}
      {/* puño que aprieta */}
      <path d="M-160 -60 C-200 -60 -210 20 -170 40 L-110 40 L-110 -60 Z" fill="#B07A50" stroke="#5A3A22" strokeWidth={5} />
    </g>
  </svg>
);

export const S6: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const tokens = quote.split(/\s+/).filter(Boolean);
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith('no')));
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2).map((x) => Math.round(x * fps));
  const unroll = lerp(f, 0, 14, 0.08, 1, outCubic);
  const flick = 0.9 + 0.1 * Math.sin(t * 7) + (hash(Math.floor(f / 3)) - 0.5) * 0.06;
  const spill = lerp(f, dur - 8, dur, 0, 1, (x) => x * x);
  const squeeze = 0.5 + 0.5 * Math.sin(t * 4);
  return (
    <AbsoluteFill style={{background: '#0A0603'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 30%, rgba(255,170,80,${0.32 * flick}) 0%, transparent 60%)`}} />
      {/* rollo vertical: varilla de arriba, papel que baja, varilla de abajo */}
      <div style={{position: 'absolute', left: 120, top: 240, width: W - 360, height: 36, borderRadius: 18, background: 'linear-gradient(180deg, #8A5A2A, #4A2E12)'}} />
      <div style={{position: 'absolute', left: 150, top: 262, width: W - 420, height: 860 * unroll, background: 'linear-gradient(90deg, #C9A86A, #EAD5A4 30%, #E2C990 70%, #B8955A)', overflow: 'hidden', padding: '60px 50px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: font.serif, fontWeight: 700, fontSize: 42, letterSpacing: '0.24em', color: '#6B3E12', marginBottom: 30}}>SENECA · DE BREVITATE VITAE 3</div>
        <div style={{fontFamily: font.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 84, lineHeight: 1.08}}>
          {tokens.map((tok, i) => {
            const a = times[i] ?? 0;
            const b = Math.max(a + 3, Math.min(times[i + 1] ?? a + 10, a + 12));
            const p = Math.max(0, Math.min(1, (f - a) / (b - a)));
            return (
              <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: '0.22em'}}>
                <span style={{visibility: 'hidden'}}>{tok}</span>
                <span style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, color: '#8A5A0E', textShadow: '0 0 1px #5A3A08, 0 0 14px rgba(255,190,70,0.55)'}}>{tok}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 250 + 860 * unroll, width: W - 360, height: 36, borderRadius: 18, background: 'linear-gradient(180deg, #8A5A2A, #4A2E12)'}} />
      <Purse squeeze={squeeze} t={t} />
      {/* la tinta se derrama hacia la pantalla de un celular */}
      {spill > 0 ? <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(10,30,90,${spill}) ${spill * 70}%, transparent ${spill * 70 + 10}%)`}} /> : null}
    </AbsoluteFill>
  );
};

// ---------------- 7) El giro: tu tiempo se lo regalás a cualquier app. Gratis. ----------------
const AppHand: React.FC<{i: number; x: number; y: number; s: number; reach: number}> = ({i, x, y, s, reach}) => {
  const colors = ['#FF3B5C', '#2E7BFF', '#25D366', '#FFB020', '#8A5CFF', '#FF6A3D'];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0'}}>
      <div style={{width: 120, height: 120, borderRadius: 30, background: colors[i % colors.length], boxShadow: '0 10px 24px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: -60 - reach * 40, top: 40, width: 80, height: 34, borderRadius: 17, background: '#EAF6FF'}} />
    </div>
  );
};

export const S7: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const freeF = wordFrame(scene, fps, 'free', 1, 'end', 0.85);
  const frozen = f >= freeF;
  const tt = frozen ? freeF / fps : t;
  const sway = Math.sin(tt * 3);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 50%, #0B1B38 0%, #02050A 70%)', filter: frozen ? 'grayscale(0.85) contrast(1.15)' : undefined}}>
      {/* fila infinita de apps con manos */}
      {Array.from({length: 9}, (_, k) => {
        const depth = 1 - k * 0.09;
        return <AppHand key={k} i={k} x={560 + k * 46} y={640 - k * 18 + (frozen ? 0 : Math.sin(tt * 4 + k) * 8)} s={depth} reach={0.5 + 0.5 * Math.sin(tt * 5 + k)} />;
      })}
      {/* la persona: abraza la bolsa de plata y regala el reloj de arena */}
      <Person x={330} y={1300} scale={1.25} lightAmt={0.8} />
      <div style={{position: 'absolute', left: 150, top: 1040, width: 170, height: 150, borderRadius: '40% 40% 30% 30%', background: 'linear-gradient(135deg, #6A4A26, #2E1E0E)', border: '4px solid #8A6A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 60, color: '#C9A060'}}>$</div>
      <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${sway * 6}px, 0)`}}>
        <PixelHourglass x={500} y={860} cell={9} p={lerp(f, 0, freeF, 0.2, 0.7, (x) => x)} t={tt} frozen={frozen} />
      </div>
      <SandStream from={[520, 860]} to={[700, 680]} bend={-60} t={tt} n={30} speed={1.4} frozen={frozen} size={10} />
      {frozen ? (
        <>
          <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f - freeF, [0, 1, 5], [0, 0.6, 0], clamp)}} />
          <div style={{position: 'absolute', top: 1060, right: 160, fontFamily: font.sans, fontWeight: 900, fontSize: 64, color: C.ice, letterSpacing: '0.1em'}}>❚❚</div>
        </>
      ) : null}
      <Headline scene={scene} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 8) Un billonario no puede comprar un minuto ----------------
export const S8: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const close = lerp(f, dur - 10, dur, 0, 1, inOut);
  const coins = useMemo(() => {
    const r = rng(88);
    return Array.from({length: 18}, () => ({d: r() * 2.6, vx: 300 + r() * 200, vy: -400 - r() * 300, s: 40 + r() * 30}));
  }, []);
  const glassX = 330;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* izquierda: el billonario y sus montañas de oro */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 540 - close * 540, height: H, overflow: 'hidden', background: 'radial-gradient(ellipse at 30% 55%, #2A1E08 0%, #050302 70%)'}}>
        <Person x={150} y={1300} scale={0.9} light="#FFC24A" lightAmt={0.8} />
        <div style={{position: 'absolute', left: 30, top: 1220, width: 260, height: 120, borderRadius: '50% 50% 10% 10%', background: 'radial-gradient(ellipse at 50% 20%, #FFE29A, #C8902A 60%, #6E4708)'}} />
        <PixelHourglass x={glassX} y={820} cell={11} p={0} t={t} empty />
        {coins.map((c, k) => {
          const lt = t - c.d;
          if (lt < 0 || lt > 1.2) return null;
          const hitT = Math.max(0.01, (glassX - 120 - 100) / c.vx);
          const x = lt < hitT ? 120 + c.vx * lt : glassX - 120 - (lt - hitT) * c.vx * 0.5;
          const y = 1180 + c.vy * lt + 900 * lt * lt;
          return <div key={k} style={{position: 'absolute', left: x, top: y, width: c.s, height: c.s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FFF1C0, #E0A93A 55%, #7A5214)'}} />;
        })}
        <div style={{position: 'absolute', left: glassX - 90, top: 1000, width: 180, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 40, color: C.ice}}>0:01</div>
      </div>
      {/* derecha: el espectador tira su arena por la canaleta del celular */}
      <div style={{position: 'absolute', left: 540 - close * 540, top: 0, width: 540 + close * 540, height: H, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -(540 - close * 540), top: 0, width: W, height: H, background: 'radial-gradient(ellipse at 75% 45%, #0C2350 0%, #03060B 65%)'}}>
          <Person x={700} y={1300} scale={0.85} lightAmt={1} />
          <Phone x={850} y={700} w={190} />
          <SandStream from={[790, 1180]} to={[850, 700]} bend={-80} t={t} n={40} speed={1.6} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 540 - close * 540 - 2, top: 0, width: 4, height: H, background: 'linear-gradient(180deg, transparent, rgba(127,227,255,0.8), transparent)'}} />
      <Headline scene={scene} />
      <ScreenFX f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 9) Sé tacaño con tu tiempo: se apaga el celular y entra la luz de oro ----------------
export const S9: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const offF = Math.round(dur * 0.18);
  const off = f >= offF;
  const warm = lerp(f, offF, offF + 24, 0, 1, (x) => x);
  const refill = lerp(f, offF + 4, dur, 0.15, 0.98, (x) => x);
  const zoom = lerp(f, 0, dur, 1, 1.15, (x) => x);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 45% 45%, rgba(255,180,70,${0.45 * warm}) 0%, rgba(120,60,10,${0.25 * warm}) 40%, transparent 70%)`}} />
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '40% 50%'}}>
        <Person x={420} y={1300} scale={1.4} light={warm > 0.5 ? C.goldHot : C.cyan} lightAmt={1} />
        <Phone x={800} y={760} w={200} on={off ? 0 : 1} glow={1 - warm} />
        {/* la arena vuelve al pecho */}
        {off ? <SandStream from={[800, 760]} to={[500, 1150]} bend={60} t={t} n={40} speed={1.3} /> : null}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: warm}}>
          <PixelHourglass x={260} y={640} cell={10} p={1 - refill} t={t} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f - offF, [0, 1, 4], [0, 0.35, 0], clamp)}} />
      <Headline scene={scene} />
      <ScreenFX f={f} warm={warm} />
    </AbsoluteFill>
  );
};

// ---------------- 10) Antes de desbloquearlo... ¿le darías $100 a un extraño? (loop) ----------------
export const S10: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const stopF = Math.round(dur * 0.3);
  const grab = lerp(f, 0, stopF, 0, 1, outCubic);
  const reflect = lerp(f, stopF, dur - 16, 0, 1, (x) => x);
  const morph = lerp(f, dur - 16, dur - 4, 0, 1, inOut);
  const headOut = lerp(f, dur - 12, dur - 3, 1, 0);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {morph < 1 ? (
        <AbsoluteFill style={{opacity: 1 - morph, transform: `scale(${1 + morph * 0.6})`}}>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, #0C1C36 0%, #02050A 70%)'}} />
          <Phone x={540} y={800} w={380} on={1 - reflect} screen={
            <>
              <div style={{position: 'absolute', top: '20%', width: '100%', textAlign: 'center', fontFamily: font.sans, fontWeight: 300, fontSize: 110, color: `rgba(255,255,255,${1 - reflect})`}}>9:41</div>
              <div style={{position: 'absolute', bottom: '12%', width: '100%', textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 30, color: `rgba(255,255,255,${0.8 * (1 - reflect)})`}}>🔒 swipe to unlock</div>
              {/* en el vidrio negro se refleja la mano con el billete */}
              <div style={{position: 'absolute', inset: 0, opacity: reflect * 0.75}}>
                <Bill x={190} y={420} w={260} rot={-8} />
              </div>
            </>
          } />
          <Hand x={540 - 260 + grab * 40} y={1200} scale={1.2} open={grab < 0.9} rot={-20} />
        </AbsoluteFill>
      ) : null}
      {/* el final es exactamente el cuadro 0 */}
      {morph > 0 ? (
        <AbsoluteFill style={{opacity: morph}}>
          <Frame0 t={(f + 1 - dur) / fps} />
        </AbsoluteFill>
      ) : null}
      <Headline scene={scene} opacity={headOut} />
      <ScreenFX f={f + 1 - dur} />
    </AbsoluteFill>
  );
};

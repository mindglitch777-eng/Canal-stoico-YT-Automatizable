// Las 11 escenas de "elegido-por-vos".
import React, {useMemo} from 'react';
import {AbsoluteFill, Freeze, interpolate, spring} from 'remotion';
import {Captions} from '../../Captions';
import {goldWords, hash, onScreenText, rng, screenTexts, syncTokens} from '../../director';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, outCubic, useLocal, wordFrame} from '../common';
import {B, Blueprint, Bucket, Cinema, Dim, fingertips, Hand, NeonPrice, Phone, PlanTitle, RedArrow, RedCircle, RedNote, Strings, Sweep} from './parts';
import {PLAN_CAPTIONS} from './theme';

export type P = {scene: Scene; dur: number; all?: Scene[]; spans?: Array<{from: number; dur: number}>};

// Posiciones del cuadro 0
const MED = {x: 540, y: 1210, w: 280, h: 320};
const SMALL = {x: 205, y: 1210, w: 170, h: 190};
const LARGE = {x: 890, y: 1210, w: 300, h: 370};
const HAND = {x: 650, y: 1030, s: 1.15};
// Los objetos del mostrador, un 20 % más grandes (anclados al mostrador).
const ZOOM: React.CSSProperties = {position: 'absolute', inset: 0, transform: 'scale(1.2)', transformOrigin: '540px 1210px'};

const Flash: React.FC<{f: number; at: number; amt?: number; color?: string}> = ({f, at, amt = 0.8, color = '#FFFFFF'}) => (
  <AbsoluteFill style={{background: color, opacity: interpolate(f - at, [0, 1, 7], [0, amt, 0], clamp), pointerEvents: 'none', zIndex: 20}} />
);

// ---------------- Cuadro 0 (también es el final del loop) ----------------
export const Frame0: React.FC<{t: number; largeK?: number; reach?: number; grip?: number}> = ({t, largeK = 1, reach = 0, grip = 1}) => (
  <AbsoluteFill style={{background: B.cinemaDeep}}>
    <Cinema t={t} />
    <div style={ZOOM}>
    <Bucket {...SMALL} t={t + 1.3} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: `${LARGE.x}px ${LARGE.y}px`, transform: `scaleY(${0.15 + 0.85 * largeK}) rotate(${(1 - largeK) * 8}deg)`}}>
      <Bucket {...LARGE} t={t + 0.6} hollow={1 - largeK} />
    </div>
    <Bucket {...MED} t={t} glow={0.35} />
    <Hand x={HAND.x} y={HAND.y} s={HAND.s} grip={grip} reach={reach} />
    </div>
  </AbsoluteFill>
);
// Versión de plano técnico del mismo cuadro.
const Frame0Blue: React.FC<{t: number; f: number; strings?: number; slack?: number}> = ({t, f, strings = 1, slack = 0}) => (
  <AbsoluteFill>
    <Blueprint />
    <div style={ZOOM}>
    <Bucket {...SMALL} mode="blue" t={t + 1.3} />
    <Bucket {...LARGE} mode="blue" t={t + 0.6} />
    <Bucket {...MED} mode="blue" t={t} />
    <Hand x={HAND.x} y={HAND.y} s={HAND.s} mode="blue" />
    <Dim x1={MED.x - MED.w * 0.5} y1={MED.y + 40} x2={MED.x + MED.w * 0.5} y2={MED.y + 40} label="MEDIUM" />
    <Strings tips={fingertips(HAND.x, HAND.y, HAND.s)} appear={strings} slack={slack} f={f} />
    </div>
  </AbsoluteFill>
);

// ---------------- 1) No elegiste el mediano. 3 trucos lo eligieron. Why? ----------------
export const S1: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const sweepF = wordFrame(scene, fps, '3', 1, 'start', 0.5);
  const whyF = wordFrame(scene, fps, 'why', 1, 'start', 0.88);
  const frozen = f >= whyF;
  const ff = frozen ? whyF : f;
  const tt = ff / fps;
  const sw = lerp(ff, sweepF, sweepF + 12, 0, 1, (x) => x);
  const strings = lerp(ff, sweepF + 6, sweepF + 18, 0, 1, outCubic);
  const zoom = 1 - 0.08 * lerp(ff, sweepF, sweepF + 30, 0, 1, inOut);
  const jam = frozen && f - whyF < 6 ? (f - whyF) % 2 === 0 ? 40 : -20 : 0;
  const blink = Math.floor(f / 6) % 2 === 0 ? 1 : 0.25;
  return (
    <AbsoluteFill style={{background: B.navy}}>
      <AbsoluteFill style={{transform: `translateY(${jam}px) scale(${zoom})`, transformOrigin: '540px 1000px'}}>
        <Frame0 t={tt} />
        <Sweep p={sw} f={ff}>
          <Frame0Blue t={tt} f={ff} strings={strings} />
        </Sweep>
      </AbsoluteFill>
      {/* el número 3 a la vista (uno de los trucos que se revelan después) */}
      {sw > 0.6 ? (
        <div style={{position: 'absolute', left: 540, top: 520, transform: 'translate(-50%,-50%) rotate(-5deg)', zIndex: 9, padding: '8px 26px', background: 'rgba(255,255,255,0.95)', border: `5px solid ${B.red}`, borderRadius: 12, fontFamily: font.sans, fontWeight: 900, fontStyle: 'italic', fontSize: 78, color: B.redInk, whiteSpace: 'nowrap'}}>
          <span style={{opacity: blink, fontSize: 104}}>3</span> TRICKS
        </div>
      ) : null}
      {frozen ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.12)', borderTop: f - whyF < 6 ? '18px solid #000' : undefined}} /> : null}
      <Flash f={f} at={sweepF} amt={0.35} color={B.cyanHot} />
      <PlanTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 2) Los precios: $3, $7, $6.50 ----------------
export const S2: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const sF = wordFrame(scene, fps, 'small', 1, 'end', 0.3);
  const lF = wordFrame(scene, fps, 'large', 1, 'end', 0.55);
  const mF = wordFrame(scene, fps, 'medium', 1, 'end', 0.8);
  const track = interpolate(f, [0, mF + 6], [160, 0], {...clamp, easing: inOut});
  const on = (a: number) => lerp(f, a, a + 6, 0, 1, (x) => x);
  const smart = on(mF + 8);
  const row = [
    {x: 230, y: 1180, w: 190, h: 220, price: '$3', at: sF},
    {x: 520, y: 1180, w: 250, h: 300, price: '$6.50', at: mF, hot: true},
    {x: 820, y: 1180, w: 290, h: 380, price: '$7', at: lF},
  ];
  return (
    <AbsoluteFill style={{background: B.cinemaDeep}}>
      <Cinema t={t} />
      <AbsoluteFill style={{transform: `translateX(${track}px)`}}>
        {row.map((b, i) => (
          <React.Fragment key={i}>
            <Bucket x={b.x} y={b.y} w={b.w} h={b.h} t={t + i} glow={b.hot ? smart : 0} />
            <NeonPrice x={b.x} y={b.y - b.h - 150} text={b.price} on={on(b.at)} f={f} size={b.hot ? 104 : 92} hot={b.hot && smart > 0.5} />
          </React.Fragment>
        ))}
        {smart > 0 ? (
          <div style={{position: 'absolute', left: 520, top: 1240, transform: `translate(-50%,0) scale(${smart}) rotate(-3deg)`, padding: '10px 26px', background: '#22C55E', border: '5px solid #0B3D1E', borderRadius: 40, fontFamily: font.sans, fontWeight: 900, fontSize: 44, color: '#FFFFFF', whiteSpace: 'nowrap', zIndex: 5}}>SMART CHOICE ✓</div>
        ) : null}
      </AbsoluteFill>
      <div style={{opacity: 0}}>{dur}</div>
    </AbsoluteFill>
  );
};

// Anzuelo de pesca enorme.
const Hook: React.FC<{x: number; y: number; s: number; color?: string; line?: number}> = ({x, y, s, color = B.cyanHot, line = 600}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <line x1={x} y1={y - line} x2={x} y2={y} stroke={color} strokeWidth={4} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={10} fill="none" stroke={color} strokeWidth={6} />
      <path d="M0 10 L0 150 C0 230 120 230 120 150 L120 110" fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
      <path d="M120 110 L96 140 M120 110 L140 136" fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" />
    </g>
  </svg>
);

// ---------------- 3) Rayos X: el grande es la carnada ----------------
export const S3: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const cheapF = wordFrame(scene, fps, 'cheap', 1, 'start', 0.75);
  const scan = lerp(f, 0, Math.round(dur * 0.35), 0, 1, (x) => x);
  const hookIn = spring({frame: f - Math.round(dur * 0.3), fps, config: {damping: 9, stiffness: 120}});
  const z = interpolate(f, [cheapF - 4, cheapF + 2], [1, 1.35], {...clamp, easing: outCubic});
  const swing = Math.sin(t * 3) * 4;
  return (
    <AbsoluteFill style={{background: B.navy}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '600px 980px'}}>
        <Blueprint />
        <Bucket x={470} y={1250} w={470} h={540} mode="blue" hollow={1} />
        <RedNote text="EMPTY · CARDBOARD" x={470} y={1040} size={40} rot={-3} p={lerp(f, Math.round(dur * 0.2), Math.round(dur * 0.3))} />
        <div style={{position: 'absolute', inset: 0, transform: `rotate(${swing}deg)`, transformOrigin: '470px 380px'}}>
          <Hook x={470} y={380 + hookIn * 420} s={1.3} line={420 + hookIn * 420} />
        </div>
        {/* el mediano, del otro lado, en colores: hacia donde apunta el anzuelo */}
        <Bucket x={860} y={1250} w={200} h={240} t={t} glow={0.6} />
        <RedArrow x1={640} y1={1000} x2={800} y2={1060} p={lerp(f, cheapF - 6, cheapF + 6)} bend={-30} />
      </AbsoluteFill>
      {/* barra del escáner */}
      {scan < 1 ? <div style={{position: 'absolute', left: 0, top: 300 + scan * 1000, width: W, height: 14, background: B.cyanHot, boxShadow: '0 0 40px #5BC0EB, 0 0 80px #5BC0EB'}} /> : null}
      <Flash f={f} at={cheapF - 4} amt={0.25} color={B.cyanHot} />
      <PlanTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 4) La prueba famosa: 84% ----------------
export const S4: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const madeF = wordFrame(scene, fps, 'made', 1, 'start', 0.45);
  const pctF = wordFrame(scene, fps, '84%', 1, 'start', 0.6);
  const n = Math.round(interpolate(f, [madeF, pctF + 2], [0, 84], {...clamp, easing: (x) => x ** 1.6}));
  const people = useMemo(() => {
    const r = rng(84);
    return Array.from({length: 70}, (_, i) => ({d: r() * 2.4, x0: 180 + r() * 720, right: i % 100 < 84 * 0.7 / 0.7 && r() < 0.84}));
  }, []);
  const sign = spring({frame: f - 6, fps, config: {damping: 10, stiffness: 160}});
  const without = lerp(f, pctF + 12, pctF + 20);
  return (
    <AbsoluteFill style={{background: B.navy}}>
      <Blueprint />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d="M110 430 L460 860 L460 960 M970 430 L620 860 L620 960" fill="none" stroke={B.cyan} strokeWidth={6} />
        <path d="M460 960 L260 1020 M620 960 L800 1020" fill="none" stroke={B.cyan} strokeWidth={6} strokeDasharray="16 10" />
      </svg>
      {/* gente chiquita */}
      {people.map((p, i) => {
        const lt = ((t * 0.8 + p.d) % 2.4) / 2.4;
        const fx = lt < 0.7 ? p.x0 + (540 - p.x0) * (lt / 0.7) : 540 + (p.right ? 1 : -1) * ((lt - 0.7) / 0.3) * 260;
        const fy = 440 + lt * 600;
        return (
          <svg key={i} width={30} height={46} style={{position: 'absolute', left: fx - 15, top: fy - 23}}>
            <circle cx={15} cy={8} r={7} fill={B.white} />
            <path d="M5 44 L8 20 L22 20 L25 44 Z" fill={B.white} />
          </svg>
        );
      })}
      {/* cartel de la opción inútil */}
      <div style={{position: 'absolute', left: 540, top: 880, transform: `translate(-50%,-50%) scale(${sign}) rotate(-4deg)`, padding: '10px 22px', background: '#FFE14D', border: `6px solid ${B.navy}`, borderRadius: 12, fontFamily: font.sans, fontWeight: 900, fontSize: 40, color: B.navy, whiteSpace: 'nowrap', zIndex: 4}}>USELESS OPTION</div>
      {/* cajas */}
      <div style={{position: 'absolute', left: 110, top: 1030, width: 330, height: 130, border: `5px solid ${B.cyan}`, borderRadius: 14, background: 'rgba(11,37,69,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 46, color: B.white}}>CHEAPER</div>
      <div style={{position: 'absolute', left: 600, top: 1000, width: 360, height: 170, border: `6px solid ${B.red}`, borderRadius: 14, background: 'rgba(60,0,10,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 110, lineHeight: 1, color: '#FF5A5A', textShadow: '0 0 20px rgba(255,59,59,0.8)'}}>{n}%</div>
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 32, color: B.white, letterSpacing: '0.1em'}}>EXPENSIVE</div>
      </div>
      <RedNote text="without it: 32%" x={300} y={960} size={40} rot={-6} p={without} />
      <Flash f={f} at={pctF} amt={0.3} color="#FF8080" />
      <PlanTitle scene={scene} />
      <div style={{opacity: 0}}>{dur}</div>
    </AbsoluteFill>
  );
};

// ---------------- 5) $4.99: el cerebro lee 4 ----------------
export const S5: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const readsF = wordFrame(scene, fps, 'reads', 1, 'start', 0.6);
  const laser = interpolate(f, [6, readsF + 4], [120, 900], {...clamp, easing: inOut});
  const hide = lerp(f, readsF + 2, readsF + 12, 0, 1, outCubic);
  const tagIn = spring({frame: f, fps, config: {damping: 10, stiffness: 140}});
  return (
    <AbsoluteFill style={{background: B.navy}}>
      <Blueprint />
      <div style={{position: 'absolute', left: 90, top: 560, width: 820, height: 420, transform: `rotate(-6deg) scale(${tagIn})`, transformOrigin: '50% 50%'}}>
        <svg width={820} height={420} style={{position: 'absolute', inset: 0}}>
          <path d="M110 20 L800 20 L800 400 L110 400 L10 210 Z" fill="#FFFFFF" stroke={B.navy} strokeWidth={10} />
          <circle cx={90} cy={210} r={24} fill={B.navy} />
        </svg>
        <div style={{position: 'absolute', left: 150, top: 40, height: 340, display: 'flex', alignItems: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 270, color: B.cinemaRed, letterSpacing: '-0.03em'}}>
          <span>$</span>
          <span style={{position: 'relative', zIndex: 2, textShadow: laser > 330 ? '0 0 40px rgba(255,59,59,0.8)' : undefined}}>4</span>
          <span style={{position: 'relative', zIndex: 1, display: 'inline-block', transform: `translateX(${-hide * 170}px) scale(${1 - hide * 0.7})`, transformOrigin: '0% 70%', opacity: 1 - hide * 0.75}}>.99</span>
        </div>
      </div>
      {/* el láser de la mirada */}
      {f < readsF + 8 ? (
        <div style={{position: 'absolute', left: laser, top: 470, width: 10, height: 620, background: '#FF3B3B', boxShadow: '0 0 30px #FF3B3B, 0 0 60px #FF3B3B', transform: 'rotate(-6deg)'}} />
      ) : null}
      <RedNote text="your brain: $4" x={560} y={1090} size={52} rot={4} p={lerp(f, readsF + 10, readsF + 16)} />
      <PlanTitle scene={scene} />
      <div style={{opacity: 0}}>{dur}</div>
    </AbsoluteFill>
  );
};

// Ancla de hierro con el precio viejo.
const Anchor: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={-900} x2={0} y2={-260} stroke={B.cyan} strokeWidth={6} />
      <circle cx={0} cy={-230} r={34} fill="none" stroke="#4A5568" strokeWidth={22} />
      <rect x={-22} y={-200} width={44} height={260} fill="#4A5568" />
      <rect x={-110} y={-160} width={220} height={36} rx={14} fill="#4A5568" />
      <path d="M-180 -10 C-160 90 -60 120 0 120 C60 120 160 90 180 -10 L140 0 C120 60 60 80 0 80 C-60 80 -120 60 -140 0 Z" fill="#4A5568" />
      <rect x={-130} y={-120} width={260} height={110} rx={16} fill="#FFFFFF" stroke={B.navy} strokeWidth={6} />
      <text x={0} y={-40} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={86} fill={B.cinemaRed}>
        $200
      </text>
    </g>
  </svg>
);

// ---------------- 6) Era $200. Ahora $99 parece un regalo ----------------
export const S6: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const wasF = wordFrame(scene, fps, 'was', 1, 'start', 0.3);
  const impF = wasF + 10;
  const ay = interpolate(f, [wasF - 6, impF], [-200, 1080], {...clamp, easing: (x) => x * x});
  const shake = f >= impF && f < impF + 10 ? (10 - (f - impF)) * 3 : 0;
  const crack = lerp(f, impF, impF + 6);
  const giftF = wordFrame(scene, fps, 'now', 1, 'start', 0.6);
  const rise = lerp(f, giftF - 4, dur, 0, 1, outCubic);
  return (
    <AbsoluteFill style={{background: B.navy, transform: `translate(${Math.sin(f * 2.1) * shake}px, ${Math.cos(f * 2.9) * shake}px)`}}>
      <Blueprint />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={60} y1={1120} x2={1020} y2={1120} stroke={B.cyan} strokeWidth={6} />
        {crack > 0
          ? [
              'M540 1120 L470 1200 L500 1260 L430 1340',
              'M540 1120 L600 1190 L580 1250 L660 1330',
              'M540 1120 L380 1150 L300 1140',
              'M540 1120 L720 1160 L800 1150',
            ].map((d, i) => <path key={i} d={d} fill="none" stroke={B.cyanHot} strokeWidth={6} strokeDasharray={400} strokeDashoffset={400 * (1 - crack)} />)
          : null}
      </svg>
      {/* el regalo de $99 que sube desde la grieta; el moño es un anzuelo */}
      {rise > 0 ? (
        <div style={{position: 'absolute', left: 540, top: 1150 - rise * 520 + Math.sin(t * 3) * 10, transform: `translate(-50%,-50%) rotate(${Math.sin(t * 2) * 4}deg) scale(${0.5 + rise * 0.5})`, zIndex: 3}}>
          <div style={{position: 'relative', width: 380, height: 260, background: '#FFFFFF', border: `8px solid ${B.navy}`, borderRadius: 18}}>
            <div style={{position: 'absolute', left: 165, top: 0, width: 50, height: '100%', background: B.red}} />
            <div style={{position: 'absolute', left: 0, top: 105, width: '100%', height: 50, background: B.red}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 120, color: B.navy, textShadow: '0 0 0 #fff, 3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff'}}>$99</div>
          </div>
          <svg width={200} height={200} style={{position: 'absolute', left: 90, top: -170, overflow: 'visible'}}>
            <path d="M100 170 L100 60 C100 10 160 10 160 60 L160 80" fill="none" stroke={B.red} strokeWidth={14} strokeLinecap="round" />
            <path d="M160 80 L140 104 M160 80 L178 102" fill="none" stroke={B.red} strokeWidth={12} strokeLinecap="round" />
            <ellipse cx={60} cy={150} rx={40} ry={22} fill={B.red} />
            <ellipse cx={140} cy={150} rx={40} ry={22} fill={B.red} />
          </svg>
        </div>
      ) : null}
      {f < impF + 30 || rise < 0.2 ? <Anchor x={540} y={ay} s={1.2} /> : <Anchor x={540} y={1080 + lerp(f, impF + 30, dur, 0, 1, (x) => x) * 600} s={1.2} />}
      <Flash f={f} at={impF} amt={0.4} />
      <PlanTitle scene={scene} />
    </AbsoluteFill>
  );
};

// Pantalla del propio video (un cuadro real del Short), congelada.
const Screen: React.FC<{all?: Scene[]; spans?: Array<{from: number; dur: number}>; idx: number; frame: number; captions?: boolean}> = ({all, spans, idx, frame, captions = false}) => {
  if (!all || !spans) return null;
  const SC = [S1, S2, S3, S4, S5, S6][idx];
  const sc = all[idx];
  return (
    <Freeze frame={Math.max(0, Math.min(spans[idx].dur - 1, frame))}>
      <AbsoluteFill style={{background: B.navy}}>
        <SC scene={sc} dur={spans[idx].dur} />
        {captions ? <Captions words={sc.words} gold={goldWords(onScreenText(sc))} screen={screenTexts(sc)} theme={PLAN_CAPTIONS} /> : null}
      </AbsoluteFill>
    </Freeze>
  );
};

// La mano (en plano técnico) que sostiene el celular.
const PhoneHand: React.FC<{cx: number; cy: number; s: number}> = ({cx, cy, s}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <g transform={`translate(${cx} ${cy + (H / 2) * s}) scale(${s * 2.4})`} fill="rgba(11,37,69,0.9)" stroke={B.cyan} strokeWidth={3}>
      <path d="M-260 -40 C-250 -120 -200 -160 -170 -150 L-150 40 Z" />
      <path d="M260 -120 C280 -160 300 -150 300 -110 L280 60 L230 40 Z" />
      <path d="M-200 0 C-160 -60 160 -60 230 -20 L260 260 L-230 260 Z" />
      <path d="M-120 260 L-150 700 M150 260 L180 700" />
    </g>
  </svg>
);

// ---------------- 7) EL GIRO: este video está en un celular ----------------
export const S7: React.FC<P> = ({scene, dur, all, spans}) => {
  const {f, fps} = useLocal();
  const out = interpolate(f, [0, Math.round(dur * 0.45)], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
  const s = 1.1 - out * 0.72;
  const cx = 540;
  const cy = 960 - out * 140;
  const mark = lerp(f, Math.round(dur * 0.5), Math.round(dur * 0.65), 0, 1, (x) => x);
  const note = lerp(f, Math.round(dur * 0.62), Math.round(dur * 0.72));
  const rewind = f < 10;
  return (
    <AbsoluteFill style={{background: B.navy}}>
      <Blueprint />
      <PhoneHand cx={cx} cy={cy} s={s} />
      <Phone cx={cx} cy={cy} s={s}>
        <Screen all={all} spans={spans} idx={5} frame={spans ? spans[5].dur - 1 : 0} />
        {rewind ? <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0 4px, transparent 4px 18px)', transform: `translateY(${(f * 37) % 18}px)`}} /> : null}
      </Phone>
      <RedCircle x={cx} y={cy} rx={(W / 2 + 90) * s} ry={(H / 2 + 80) * s} p={mark} />
      <RedArrow x1={150} y1={1150} x2={cx - (W / 2) * s - 20} y2={cy + 120} p={note} bend={-60} />
      <RedNote text="TRICK #1" x={200} y={1150} size={56} rot={-8} p={note} />
      <PlanTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 8) Los tres trucos de ESTE video ----------------
export const S8: React.FC<P> = ({scene, dur, all, spans}) => {
  const {f, fps, t} = useLocal();
  const qF = wordFrame(scene, fps, 'question', 1, 'start', 0.2);
  const tF = wordFrame(scene, fps, 'three', 1, 'start', 0.5);
  const lF = wordFrame(scene, fps, 'lit', 1, 'start', 0.75);
  const s = 0.38;
  const cx = 540;
  const cy = 820;
  const toScreen = (x: number, y: number): [number, number] => [cx + (x - W / 2) * s, cy + (y - H / 2) * s];
  // el cuadro del 'Why?' del gancho
  const s1 = all?.[0];
  const whyLocal = s1 ? Math.round((s1.words.find((w) => w.text.toLowerCase().startsWith('why'))?.start ?? s1.duration * 0.88) * fps) + 3 : 0;
  const [wx, wy] = toScreen(540, 1255);
  const [nx, ny] = toScreen(540, 520);
  const pull = lerp(f, qF + 6, qF + 22, 0, 1, inOut);
  const hit = [qF, tF, lF];
  const shake = hit.reduce((a, h) => a + (f >= h && f < h + 6 ? (6 - (f - h)) * 2 : 0), 0);
  return (
    <AbsoluteFill style={{background: B.navy, transform: `translate(${Math.sin(f * 2.3) * shake}px, 0)`}}>
      <Blueprint />
      <PhoneHand cx={cx} cy={cy} s={s} />
      <Phone cx={cx} cy={cy} s={s}>
        <Screen all={all} spans={spans} idx={0} frame={whyLocal} captions />
      </Phone>
      {/* 1: el 'Why?' del gancho es un anzuelo que tira de vos */}
      {f >= qF ? (
        <>
          <RedCircle x={wx} y={wy} rx={95} ry={45} p={lerp(f, qF, qF + 8)} w={9} />
          <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', zIndex: 9}}>
            <path d={`M${wx + 60} ${wy + 20} Q${wx + 260} ${wy + 120} ${wx + 300 + pull * 60} ${wy + 230 + pull * 40}`} fill="none" stroke={B.red} strokeWidth={6} strokeDasharray="10 8" opacity={pull} />
            <g transform={`translate(${wx + 300 + pull * 60} ${wy + 230 + pull * 40}) scale(0.5)`} opacity={pull}>
              <path d="M0 0 L0 80 C0 130 70 130 70 80 L70 60" fill="none" stroke={B.red} strokeWidth={14} strokeLinecap="round" />
            </g>
          </svg>
          <RedNote text="#1 a question" x={210} y={wy - 40} size={44} rot={-7} p={lerp(f, qF + 4, qF + 10)} />
        </>
      ) : null}
      {/* 2: el número 3 que titila */}
      {f >= tF ? (
        <>
          <RedCircle x={nx} y={ny} rx={170} ry={60} p={lerp(f, tF, tF + 8)} w={9} />
          <RedNote text="#2 the number 3" x={830} y={ny - 120} size={44} rot={6} p={lerp(f, tF + 4, tF + 10)} />
        </>
      ) : null}
      {/* 3: los subtítulos que se encienden: la flecha apunta a la palabra que suena AHORA */}
      {f >= lF ? (
        <>
          <RedArrow x1={880} y1={1000} x2={700} y2={1180} p={lerp(f, lF, lF + 8)} bend={60} />
          <RedNote text="#3 lit words" x={860} y={960} size={44} rot={-5} p={lerp(f, lF + 2, lF + 8)} />
        </>
      ) : null}
      {hit.map((h, i) => (
        <Flash key={i} f={f} at={h} amt={0.2} color="#FF9A9A" />
      ))}
      <PlanTitle scene={scene} top={150} size={86} />
      <div style={{opacity: 0}}>{t + dur}</div>
    </AbsoluteFill>
  );
};

// ---------------- 9) La cita: "Esperame un poco, apariencia" (vela y reloj de arena) ----------------
export const S9: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const tokens = quote.split(/\s+/).filter(Boolean);
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith('wait')));
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2.2).map((x) => Math.round(x * fps));
  const preT = syncTokens(['Epictetus', 'said'], scene.words, 1).map((x) => Math.round(x * fps));
  const stopF = Math.round(dur * 0.35);
  const sandT = Math.min(t, stopF / fps);
  const flick = 1 + 0.06 * Math.sin(t * 13) + 0.04 * Math.sin(t * 29);
  const last = times[times.length - 1] ?? 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 70%, #3A2A1A 0%, #120C08 60%, #070504 100%)'}}>
      {/* luz de vela */}
      <div style={{position: 'absolute', left: -200, top: 600, width: 1000, height: 1000, background: `radial-gradient(circle, rgba(255,170,80,${0.35 * flick}), transparent 60%)`}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="flame9" cx="50%" cy="70%" r="60%">
            <stop offset="0" stopColor="#FFFBE6" />
            <stop offset="0.4" stopColor="#FFC85A" />
            <stop offset="1" stopColor="#FF7A1A" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={230} y={1000} width={90} height={220} rx={8} fill="#EFE3C8" />
        <ellipse cx={275} cy={985 - 4 * flick} rx={22 * flick} ry={48 * flick} fill="url(#flame9)" />
        {/* reloj de arena */}
        <g transform="translate(700 1060)">
          <rect x={-120} y={-190} width={240} height={20} rx={6} fill="#6B4A2A" />
          <rect x={-120} y={170} width={240} height={20} rx={6} fill="#6B4A2A" />
          <path d="M-95 -170 C-95 -60 -10 -20 -10 0 C-10 20 -95 60 -95 170 L95 170 C95 60 10 20 10 0 C10 -20 95 -60 95 -170 Z" fill="rgba(220,235,255,0.12)" stroke="#CFC6B0" strokeWidth={4} />
          <path d={`M${-70 + sandT * 6} ${-120 + sandT * 20} L${70 - sandT * 6} ${-120 + sandT * 20} L10 -8 L-10 -8 Z`} fill="#E9C77A" />
          <path d={`M-85 165 L85 165 L${40 - sandT * 2} ${150 - sandT * 25} L${-40 + sandT * 2} ${150 - sandT * 25} Z`} fill="#E9C77A" />
          {f < stopF ? <line x1={0} y1={-6} x2={0} y2={150 - sandT * 25} stroke="#E9C77A" strokeWidth={4} /> : null}
        </g>
        {/* la mano que lo frena */}
        <g transform={`translate(${700 + 260 - lerp(f, 0, stopF, 0, 1, outCubic) * 150} 1010)`}>
          <path d="M0 -60 C-40 -60 -60 -30 -60 0 L-60 60 C-60 90 -30 100 0 100 L160 100 L160 -60 Z" fill="#C8956E" stroke="#8A5A3A" strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-110} y={-56 + i * 38} width={80} height={32} rx={16} fill="#C8956E" stroke="#8A5A3A" strokeWidth={3} />
          ))}
        </g>
        {/* hilos de marioneta flojos */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${120 + i * 260} 0 Q${160 + i * 260} ${700 + i * 40} ${90 + i * 250} 1500`} fill="none" stroke="rgba(160,200,230,0.35)" strokeWidth={3} />
        ))}
      </svg>
      <div style={{position: 'absolute', top: 300, width: W - 120, left: 0, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 50, letterSpacing: '0.3em', color: '#FFE2B0'}}>
        {['EPICTETUS', 'SAID:'].map((w, i) => (
          <span key={i} style={{marginRight: '0.5em', opacity: Math.max(0, Math.min(1, (f - preT[i] + 3) / 4))}}>
            {w}
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 400, left: 70, width: W - 190, padding: '26px 30px', background: 'rgba(10,6,3,0.82)', borderRadius: 20, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 118, lineHeight: 1.04, color: '#FFF1DC'}}>
        {tokens.map((tok, i) => {
          const a = times[i] ?? 0;
          const on = Math.max(0, Math.min(1, (f - a + 2) / 4));
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.12em', opacity: 0.15 + 0.85 * on, textShadow: on > 0.5 ? '0 0 26px rgba(255,190,110,0.7)' : undefined}}>
              {tok}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 830, width: W - 120, left: 0, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', fontSize: 48, color: '#E9C77A', opacity: lerp(f, last, last + 10)}}>Epictetus, Discourses 2.18</div>
    </AbsoluteFill>
  );
};

// ---------------- 10) Tres segundos de pausa: los trucos dejan de funcionar ----------------
export const S10: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const nowF = wordFrame(scene, fps, 'now', 1, 'start', 0.55);
  const trF = wordFrame(scene, fps, 'tricks', 1, 'start', 0.7);
  const slack = lerp(f, nowF - 2, nowF + 16, 0, 1, (x) => x * x);
  const collapse = lerp(f, trF, trF + 14, 1, 0, (x) => x * x);
  const slow = t * 0.25;
  return (
    <AbsoluteFill>
      <Frame0 t={slow} largeK={collapse} reach={150 + Math.sin(t * 2) * 4} grip={0.25} />
      <div style={ZOOM}>
        <Strings tips={fingertips(HAND.x, HAND.y, HAND.s, 150)} slack={slack} color="rgba(255,255,255,0.9)" f={f} />
      </div>
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.18)'}} />
      <PlanTitle scene={scene} bright />
      <div style={{opacity: 0}}>{dur}</div>
    </AbsoluteFill>
  );
};

// ---------------- 11) La próxima, preguntate: ¿lo elegí yo? (vuelve el cuadro 0) ----------------
export const S11: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const fl = f + 1 - dur;
  const settle = Math.round(dur * 0.5);
  const k = lerp(f, 0, settle, 0, 1, inOut);
  const headOut = lerp(f, dur - 14, dur - 4, 1, 0);
  const tt = f >= settle ? fl / fps : (settle + 1 - dur) / fps - (settle - f) / fps * 0.25;
  return (
    <AbsoluteFill>
      {f >= settle ? <Frame0 t={fl / fps} /> : <Frame0 t={tt} largeK={lerp(f, 0, settle * 0.6, 0, 1, outCubic)} reach={150 * (1 - k)} grip={0.25 + 0.75 * k} />}
      <PlanTitle scene={scene} bright opacity={headOut} />
    </AbsoluteFill>
  );
};

export const _unused = {hash, H, Dim};

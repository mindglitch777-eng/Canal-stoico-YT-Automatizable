// Las 11 escenas de "la-voz".
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash, rng, syncTokens} from '../../director';
import {font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {clamp, inOut, lerp, outCubic, outExpo, useLocal, wordFrame} from '../common';
import {Blinds, Detective, DetectiveHead, Film, goldVoice, N, NoirTitle, Rain, RedLetters, redVoice, ShopWindow, Skyline, SmokeMouth} from './parts';

type P = {scene: Scene; dur: number};

const Street: React.FC<{t: number}> = ({t}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0A0A0A 0%, #161616 60%, #0C0C0C 100%)'}} />
    {/* adoquines mojados */}
    <div style={{position: 'absolute', left: 0, top: 1250, width: W, height: 670, background: 'repeating-linear-gradient(90deg, #121212 0px, #121212 60px, #181818 60px, #181818 64px)', opacity: 0.9}} />
    <div style={{position: 'absolute', left: 0, top: 1250, width: W, height: 670, background: `linear-gradient(180deg, rgba(230,230,230,${0.12 + 0.03 * Math.sin(t)}), transparent 60%)`}} />
  </>
);

// ---------------- Cuadro 0 (también es el final del loop) ----------------
export const Frame0: React.FC<{t: number; f: number; frozen?: boolean; rainSpeed?: number}> = ({t, f, frozen = false, rainSpeed = 1}) => (
  <AbsoluteFill style={{background: N.black}}>
    <Street t={t} />
    <ShopWindow x={500} y={380} w={460} h={820} t={t} />
    {/* luz de la vidriera sobre la calle */}
    <div style={{position: 'absolute', left: 300, top: 1180, width: 760, height: 380, background: 'radial-gradient(ellipse at 60% 0%, rgba(230,230,230,0.35), transparent 70%)'}} />
    <DetectiveHead x={330} y={880} s={1.38} rimAmt={1} />
    {/* la boca de humo rojo detrás de su oreja */}
    <SmokeMouth x={150} y={760} s={0.62} f={f} />
    <RedLetters text="you deserve it" x={540} y={600} size={72} f={f} appear={1} />
    <Rain t={t} frozen={frozen} speed={rainSpeed} />
    <Film f={f} />
  </AbsoluteFill>
);

// ---------------- 1) 3 palabras. Siempre. ----------------
export const S1: React.FC<P> = ({scene}) => {
  const {f, fps, t} = useLocal();
  const whyF = wordFrame(scene, fps, 'why', 1, 'start', 0.85);
  const frozen = f >= whyF;
  const ft = frozen ? whyF : f;
  return (
    <AbsoluteFill>
      <Frame0 t={ft / fps} f={ft} frozen={frozen} />
      {/* relámpago en 'Why?' */}
      <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f - whyF, [0, 1, 3, 4, 8], [0, 0.95, 0.2, 0.7, 0], clamp)}} />
      <NoirTitle scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------- 2) Día largo. Estás cansado. "You deserve it." ----------------
export const S2: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const youF = wordFrame(scene, fps, 'you', 2, 'start', 0.7);
  const zoom = lerp(f, 0, dur, 1, 1.22, (x) => x);
  const appear = lerp(f, youF - 2, youF + 22, 0, 1, (x) => x);
  const buy = lerp(f, dur - 10, dur, 0, 1, outCubic);
  return (
    <AbsoluteFill style={{background: N.black}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '760px 820px'}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, #2A2A2A 0%, #0A0A0A 65%)'}} />
        {/* sillón */}
        <div style={{position: 'absolute', left: 40, top: 1040, width: 900, height: 300, borderRadius: '60px 60px 20px 20px', background: 'linear-gradient(180deg, #262626, #0E0E0E)'}} />
        <div style={{position: 'absolute', left: 0, top: 960, width: 140, height: 380, borderRadius: 40, background: '#1C1C1C'}} />
        <DetectiveHead x={400} y={900} s={1.1} rimAmt={0.6} rim={N.silver} />
        {/* el celular: la única luz del cuarto */}
        <div style={{position: 'absolute', left: 700, top: 700, width: 150, height: 300, borderRadius: 24, background: '#101010', padding: 10, boxSizing: 'border-box'}}>
          <div style={{width: '100%', height: '100%', borderRadius: 16, background: 'linear-gradient(170deg, #F2F2F2, #9A9A9A)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 18, boxSizing: 'border-box'}}>
            <div style={{opacity: buy, padding: '6px 10px', borderRadius: 10, background: '#111', color: '#EEE', fontFamily: font.sans, fontWeight: 900, fontSize: 20}}>BUY NOW</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 520, top: 560, width: 500, height: 600, background: 'radial-gradient(ellipse, rgba(240,240,240,0.25), transparent 65%)'}} />
        <SmokeMouth x={760} y={760} s={0.5} f={f} talk={f > youF ? 1 : 0.3} />
      </AbsoluteFill>
      <Blinds />
      {/* el humo escribe en el aire */}
      <RedLetters text="you deserve" x={510} y={300} size={112} f={f} appear={Math.min(1, appear * 1.3)} />
      <RedLetters text="it." x={510} y={430} size={130} f={f} appear={Math.max(0, appear * 1.3 - 0.3)} />
      <Film f={f} />
      <div style={{opacity: 0}}>{t}</div>
    </AbsoluteFill>
  );
};

// ---------------- 3) Clic. −$84. ----------------
export const S3: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const press = spring({frame: f - 2, fps, config: {damping: 9, stiffness: 300, mass: 0.5}});
  const cut = Math.round(dur * 0.42);
  const wallet = f >= cut;
  const fly = lerp(f, cut, dur, 0, 1, (x) => x);
  return (
    <AbsoluteFill style={{background: N.black}}>
      {!wallet ? (
        <>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 55%, #EDEDED 0%, #8A8A8A 45%, #111 80%)'}} />
          <div style={{position: 'absolute', left: 160, top: 760, width: 760, height: 260, borderRadius: 60, background: '#0A0A0A', transform: `scale(${1 - press * 0.06})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 120, color: '#F2F2F2', letterSpacing: '0.04em'}}>BUY</div>
          {/* el dedo */}
          <div style={{position: 'absolute', left: 470, top: 880 - (1 - press) * 260, width: 170, height: 700, borderRadius: '90px 90px 30px 30px', background: 'linear-gradient(90deg, #2A2A2A, #5A5A5A 50%, #2A2A2A)'}} />
          <AbsoluteFill style={{background: '#FFFFFF', opacity: interpolate(f, [2, 3, 6], [0, 0.6, 0], clamp)}} />
        </>
      ) : (
        <>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 60%, #2A2A2A, #070707 70%)'}} />
          {/* billetera abierta */}
          <div style={{position: 'absolute', left: 180, top: 980, width: 420, height: 260, borderRadius: 20, background: 'linear-gradient(135deg, #2E2E2E, #141414)', border: '4px solid #3A3A3A'}} />
          {/* fantasmas de billetes que se lleva el humo por la ventana */}
          {Array.from({length: 6}, (_, k) => {
            const p = Math.max(0, Math.min(1, fly * 1.6 - k * 0.12));
            return (
              <div key={k} style={{position: 'absolute', left: 260 + p * 520 + k * 10, top: 1000 - p * 620 + Math.sin(p * 6 + k) * 40, width: 220, height: 100, borderRadius: 8, background: 'rgba(235,235,235,0.55)', border: '2px solid rgba(255,255,255,0.8)', transform: `rotate(${p * 60 - 10 + k * 7}deg)`, opacity: 1 - p * 0.7}} />
            );
          })}
          <SmokeMouth x={760} y={420} s={0.5} f={f} />
          <div style={{position: 'absolute', left: 740, top: 260, width: 220, height: 300, border: '8px solid #333', background: 'rgba(160,160,160,0.15)'}} />
          <div style={{position: 'absolute', top: 640, width: W - 120, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 200, ...redVoice(f, 0)}}>−$84</div>
        </>
      )}
      <Rain t={t} opacity={0.25} />
      <NoirTitle scene={scene} />
      <Film f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 4) Viernes. Día de cobro. Ruptura. (montaje cada vez más rápido) ----------------
const Bag: React.FC<{x: number; y: number; rot: number; s?: number}> = ({x, y, rot, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 150 * s, height: 180 * s, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', left: '25%', top: -30 * s, width: '50%', height: 50 * s, border: `${8 * s}px solid #8A8A8A`, borderBottom: 'none', borderRadius: '40px 40px 0 0'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #DADADA, #8E8E8E)', border: '3px solid #2A2A2A'}} />
  </div>
);
export const S4: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const cuts = ['friday', 'payday', 'breakup'].map((w, i) => wordFrame(scene, fps, w, 1, 'start', i / 3));
  const seg = f < cuts[1] ? 0 : f < cuts[2] ? 1 : 2;
  const bags = useMemo(() => {
    const r = rng(41);
    return Array.from({length: 46}, (_, k) => ({x: r() * (W - 260), rot: (r() - 0.5) * 60, at: k, s: 0.8 + r() * 0.5}));
  }, []);
  const nBags = Math.floor(interpolate(f, [cuts[0], dur], [0, 46], {...clamp, easing: (x) => x * x}));
  const flash = Math.max(0, ...cuts.map((c) => (f >= c && f < c + 4 ? 1 - (f - c) / 4 : 0)));
  return (
    <AbsoluteFill style={{background: N.black}}>
      {seg === 0 ? (
        <>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #3A3A3A, #0A0A0A 70%)'}} />
          <div style={{position: 'absolute', left: 0, top: 1000, width: W, height: 60, background: '#2A2A2A'}} />
          {Array.from({length: 6}, (_, k) => (
            <div key={k} style={{position: 'absolute', left: 120 + k * 140, top: 900, width: 50, height: 100, border: '4px solid #AAA', borderTop: 'none', borderRadius: '0 0 20px 20px'}} />
          ))}
          <div style={{position: 'absolute', left: 120, top: 420, fontFamily: font.sans, fontWeight: 900, fontSize: 70, letterSpacing: '0.3em', color: '#CFCFCF', textShadow: '0 0 20px #FFF'}}>BAR</div>
          <Detective x={700} y={1250} s={1.3} />
        </>
      ) : seg === 1 ? (
        <>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1A1A1A, #050505)'}} />
          <div style={{position: 'absolute', left: 260, top: 520, width: 380, height: 640, background: '#2A2A2A', border: '6px solid #444'}}>
            <div style={{margin: 40, height: 200, background: 'linear-gradient(170deg, #E0E0E0, #8A8A8A)'}} />
            <div style={{margin: '0 40px', height: 30, background: '#111'}} />
          </div>
          <Detective x={780} y={1250} s={1.3} />
        </>
      ) : (
        <>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, #4A4A4A, #050505 60%)'}} />
          <div style={{position: 'absolute', left: 520, top: 260, width: 20, height: 1000, background: '#2A2A2A'}} />
          <Detective x={540} y={1250} s={1.4} />
          <Rain t={t} n={220} speed={1.4} opacity={0.8} />
        </>
      )}
      {/* el susurro en cada escena */}
      <SmokeMouth x={[480, 560, 360][seg]} y={760} s={0.55} f={f} />
      <RedLetters text="you deserve it" x={540} y={720} size={74} f={f} appear={1} />
      {/* bolsas que caen y lo tapan */}
      {bags.slice(0, nBags).map((b, k) => {
        const lt = (f - (cuts[0] + (k / 46) * (dur - cuts[0]) * 0.9)) / fps;
        const settle = 1400 - Math.floor(k / 6) * 90;
        const y = Math.min(settle, -200 + lt * 2600);
        return <Bag key={k} x={b.x} y={y} rot={b.rot} s={b.s} />;
      })}
      <AbsoluteFill style={{background: '#FFFFFF', opacity: flash * 0.5}} />
      <NoirTitle scene={scene} />
      <Film f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 5) $8,736 por año (neón rojo sobre la ciudad) ----------------
export const Neon: React.FC<{f: number; gold?: number; on?: number; top?: number}> = ({f, gold = 0, on = 1, top = 420}) => {
  const col = gold > 0.5 ? N.goldHot : N.redHot;
  const glow = gold > 0.5 ? 'rgba(255,200,90,0.95)' : 'rgba(255,30,50,0.95)';
  const flick = on * (hash(Math.floor(f / 2)) > 0.08 ? 1 : 0.4);
  return (
    <div style={{position: 'absolute', top, width: W - 60, textAlign: 'center'}}>
      <div style={{display: 'inline-block', padding: '20px 40px', border: `8px solid ${col}`, borderRadius: 24, boxShadow: `0 0 40px ${glow}, inset 0 0 30px ${glow}`, opacity: flick, background: 'rgba(0,0,0,0.6)'}}>
        <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 190, lineHeight: 1, color: col, textShadow: `0 0 30px ${glow}, 0 0 60px ${glow}`}}>$8,736</div>
        <div style={{fontFamily: font.serif, fontWeight: 700, fontSize: 64, letterSpacing: '0.3em', color: N.white, marginTop: 6}}>A YEAR</div>
      </div>
    </div>
  );
};
export const S5: React.FC<P> = ({scene, dur}) => {
  const {f, t} = useLocal();
  const on = lerp(f, 4, 12, 0, 1, (x) => x);
  const tilt = lerp(f, 0, dur, 8, 0, outCubic);
  return (
    <AbsoluteFill style={{background: N.black}}>
      <AbsoluteFill style={{transform: `perspective(1200px) rotateX(${tilt}deg) scale(1.06)`}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #050505 0%, #1A1A1A 70%)'}} />
        <Skyline y={1450} t={t} />
        <Neon f={f} on={on} />
        <div style={{position: 'absolute', left: 0, top: 460, width: W, height: 500, background: `radial-gradient(ellipse at 50% 40%, rgba(255,30,50,${0.25 * on}), transparent 70%)`}} />
      </AbsoluteFill>
      {/* lluvia que cae hacia la cámara */}
      <Rain t={t} n={180} speed={1.6} opacity={0.7} />
      <Film f={f} />
      <div style={{opacity: 0}}>{scene.say}</div>
    </AbsoluteFill>
  );
};

// ---------------- 6) La persecución: publicidades, apps, ofertas de medianoche ----------------
export const S6: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const adsF = wordFrame(scene, fps, 'ads', 1, 'start', 0.45);
  const appsF = wordFrame(scene, fps, 'apps', 1, 'start', 0.6);
  const midF = wordFrame(scene, fps, 'midnight', 1, 'start', 0.75);
  const stopF = Math.round(dur * 0.9);
  const running = f < stopF;
  const shake = running ? 10 : 0;
  const sx = Math.sin(f * 1.3) * shake;
  const sy = Math.cos(f * 1.7) * shake * 0.6;
  const src = f < adsF ? -1 : f < appsF ? 0 : f < midF ? 1 : 2;
  return (
    <AbsoluteFill style={{background: N.black}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(1.05)`}}>
        {/* callejón en perspectiva */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <path d="M0 0 L400 760 L400 1160 L0 1920 Z" fill="#141414" />
          <path d="M1080 0 L680 760 L680 1160 L1080 1920 Z" fill="#101010" />
          <path d="M0 1920 L400 1160 L680 1160 L1080 1920 Z" fill="#1C1C1C" />
          <rect x={400} y={760} width={280} height={400} fill="#262626" />
          {/* charcos que brillan */}
          {Array.from({length: 6}, (_, k) => (
            <ellipse key={k} cx={540 + (hash(k) - 0.5) * 300} cy={1300 + k * 90} rx={60 + k * 20} ry={10 + k * 3} fill="rgba(220,220,220,0.18)" />
          ))}
          {/* rastro de humo rojo */}
          <path d={`M540 900 C${500 + Math.sin(t * 2) * 60} 1100 ${600 - Math.sin(t * 2) * 60} 1300 540 1700`} fill="none" stroke={N.red} strokeWidth={18} strokeOpacity={0.7} strokeLinecap="round" />
        </svg>
        {/* fuentes del humo, una por golpe */}
        {src === 0 ? (
          <div style={{position: 'absolute', left: 60, top: 600, width: 520, height: 360, background: 'linear-gradient(135deg, #E0E0E0, #7A7A7A)', border: '10px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 80, color: '#111'}}>SALE</div>
        ) : null}
        {src === 1
          ? Array.from({length: 14}, (_, k) => (
              <div key={k} style={{position: 'absolute', left: 120 + (k % 5) * 160 + Math.sin(t * 4 + k) * 10, top: 600 + Math.floor(k / 5) * 150 + Math.cos(t * 3 + k) * 10, width: 110, height: 110, borderRadius: 26, background: k % 2 ? '#CFCFCF' : '#8A8A8A', border: '4px solid #111'}} />
            ))
          : null}
        {src === 2 ? <ShopWindow x={160} y={600} w={760} h={420} t={t} label="MIDNIGHT SALE" /> : null}
        {src >= 0 ? <SmokeMouth x={[320, 540, 540][src]} y={[780, 840, 820][src]} s={0.6} f={f} /> : null}
        <Detective x={540} y={1560} s={1.7} run={running ? 1 : 0} phase={f * 0.7} />
      </AbsoluteFill>
      <Rain t={t} n={160} speed={1.3} opacity={0.6} />
      <NoirTitle scene={scene} size={92} />
      <Film f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 7) EL GIRO: el reflejo susurra con tu voz ----------------
export const S7: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const youF = wordFrame(scene, fps, 'you', 1, 'start', 0.7);
  const off = lerp(f, 0, 6, 1, 0, (x) => x); // las publicidades se apagan de golpe
  const flip = interpolate(f, [youF - 10, youF + 4], [0, 180], {...clamp, easing: inOut});
  const flipped = flip >= 90;
  const dropF = Math.round(dur * 0.82);
  const ripple = Math.max(0, f - dropF);
  const wob = ripple > 0 ? Math.sin(ripple * 0.9) * Math.max(0, 1 - ripple / 14) * 0.12 : 0;
  return (
    <AbsoluteFill style={{background: N.black}}>
      {/* las publicidades de fondo se apagan */}
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(200,200,200,${0.35 * off}), transparent 60%)`}} />
      <AbsoluteFill style={{perspective: 1600}}>
        <AbsoluteFill style={{transform: `rotateX(${flip}deg)`, transformStyle: 'preserve-3d'}}>
          {/* cara A: picado al charco, el reflejo (de cabeza) tiene la boca roja */}
          <AbsoluteFill style={{backfaceVisibility: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, background: '#101010'}} />
            <div style={{position: 'absolute', left: 90, top: 520, width: 900, height: 820, borderRadius: '50%', background: 'radial-gradient(ellipse, #2E2E2E 0%, #151515 70%)', border: '6px solid #252525', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, transform: `scaleY(${-1 + wob}) scaleX(${1 + wob})`, transformOrigin: '50% 50%'}}>
                <div style={{position: 'absolute', left: -90, top: -520}}>
                  <div style={{position: 'absolute', left: 300, top: 700, width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(255,30,50,0.35), transparent 65%)'}} />
                  <DetectiveHead x={520} y={980} s={1.45} rim={N.redHot} rimAmt={0.5} mouth="red" open={Math.abs(Math.sin(f * 0.45))} />
                  <SmokeMouth x={690} y={990} s={0.55} f={f} wisps />
                </div>
              </div>
              {/* ondas de la gota */}
              {ripple > 0
                ? [0, 1, 2].map((k) => (
                    <div key={k} style={{position: 'absolute', left: 450 - (ripple * 22 - k * 60), top: 410 - (ripple * 22 - k * 60) * 0.9, width: Math.max(0, (ripple * 22 - k * 60) * 2), height: Math.max(0, (ripple * 22 - k * 60) * 1.8), borderRadius: '50%', border: '4px solid rgba(230,230,230,0.6)', opacity: Math.max(0, 1 - ripple / 20)}} />
                  ))
                : null}
            </div>
            {/* sus zapatos al borde del charco */}
            <div style={{position: 'absolute', left: 380, top: 1340, width: 120, height: 60, borderRadius: 30, background: '#050505'}} />
            <div style={{position: 'absolute', left: 560, top: 1340, width: 120, height: 60, borderRadius: 30, background: '#050505'}} />
          </AbsoluteFill>
          {/* cara B: dan vuelta los lugares: ahora el humo le sale de SU boca */}
          <AbsoluteFill style={{backfaceVisibility: 'hidden', transform: 'rotateX(180deg)'}}>
            <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 45%, #2A2A2A, #050505 70%)'}} />
            <DetectiveHead x={420} y={980} s={1.55} rim={N.redHot} rimAmt={0.7} mouth="red" open={Math.abs(Math.sin(f * 0.45))} />
            <SmokeMouth x={720} y={1000} s={0.6} f={f} />
            <RedLetters text="you deserve it" x={560} y={1220} size={70} f={f} />
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* la gota que cae */}
      {f > dropF - 8 && f < dropF ? <div style={{position: 'absolute', left: 530, top: interpolate(f, [dropF - 8, dropF], [200, 920], clamp), width: 22, height: 40, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#EDEDED'}} /> : null}
      <Rain t={t} n={60} speed={0.5} opacity={0.35} />
      <NoirTitle scene={scene} top={flipped ? 200 : 200} />
      <Film f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 8) La cita, escrita en la lluvia (blanco cálido) ----------------
export const S8: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const tokens = quote.split(/\s+/).filter(Boolean);
  const startIdx = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith('live')));
  const times = syncTokens(tokens, scene.words.slice(startIdx), 2.5).map((x) => Math.round(x * fps));
  const pre = ['SENECA', 'WARNED:'];
  const preT = syncTokens(['Seneca', 'warned'], scene.words, 1).map((x) => Math.round(x * fps));
  const gather = lerp(f, dur - 12, dur, 0, 1, (x) => x * x);
  return (
    <AbsoluteFill style={{background: N.black}}>
      <Rain t={t * 0.25} n={120} opacity={0.4} />
      <div style={{position: 'absolute', top: 400, width: W - 120, textAlign: 'center', fontFamily: font.sans, fontWeight: 800, fontSize: 52, letterSpacing: '0.3em', color: N.white}}>
        {pre.map((w, i) => (
          <span key={i} style={{marginRight: '0.6em', opacity: Math.max(0, Math.min(1, (f - preT[i] + 3) / 4))}}>
            {w}
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 520, left: 70, width: W - 190, padding: '30px 30px', background: 'rgba(0,0,0,0.7)', textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 96, lineHeight: 1.08, textTransform: 'uppercase', opacity: 1 - gather}}>
        {tokens.map((tok, i) => {
          const a = times[i] ?? 0;
          const on = Math.max(0, Math.min(1, (f - a + 2) / 4));
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', margin: '0 0.14em', color: N.warm, opacity: 0.2 + 0.8 * on, textShadow: on > 0.5 ? '0 0 24px rgba(255,241,220,0.8)' : undefined}}>
              {/* la gota que cae y enciende la palabra */}
              {f > a - 6 && f < a + 1 ? <span style={{position: 'absolute', left: '50%', top: interpolate(f, [a - 6, a], [-500, 0], clamp), width: 8, height: 30, marginLeft: -4, borderRadius: 4, background: N.warm}} /> : null}
              {tok}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1250, width: W - 120, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', fontSize: 50, color: N.warm, opacity: lerp(f, times[times.length - 1] ?? 0, (times[times.length - 1] ?? 0) + 10)}}>Letters to Lucilius, 16</div>
      {/* las gotas se juntan en una luz dorada en el pecho */}
      {gather > 0 ? <div style={{position: 'absolute', left: 540 - 300 * gather, top: 900 - 300 * gather, width: 600 * gather, height: 600 * gather, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,154,0.9), rgba(233,180,76,0.3) 50%, transparent 70%)'}} /> : null}
      <Film f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 9) "Not today": la voz de oro rompe el humo rojo ----------------
export const S9: React.FC<P> = ({scene, dur}) => {
  const {f, fps, t} = useLocal();
  const notF = wordFrame(scene, fps, 'not', 1, 'start', 0.7);
  const split = interpolate(f, [notF, notF + 14], [540, 120], {...clamp, easing: outCubic});
  const hit = f >= notF + 8;
  const shards = useMemo(() => {
    const r = rng(91);
    return Array.from({length: 40}, () => ({x: 150 + r() * 400, y: 800 + r() * 450, vx: (r() - 0.6) * 500, vy: -200 - r() * 400, s: 10 + r() * 40, rot: r() * 360}));
  }, []);
  const lt = Math.max(0, f - notF - 8) / fps;
  const fly = lerp(f, notF, notF + 8, 0, 1, (x) => x);
  return (
    <AbsoluteFill style={{background: N.black}}>
      {/* izquierda: el reflejo rojo */}
      <div style={{position: 'absolute', left: 0, top: 0, width: split, height: H, overflow: 'hidden', background: 'radial-gradient(ellipse at 30% 50%, #2A0A0E, #050505 70%)'}}>
        <div style={{transform: 'scaleX(-1)', transformOrigin: '270px 50%', position: 'absolute', inset: 0}}>
          <DetectiveHead x={300} y={1060} s={1.5} rim={N.redHot} rimAmt={0.8} mouth="red" open={0.6} />
        </div>
        {!hit ? <SmokeMouth x={330} y={1010} s={0.9} f={f} /> : null}
      </div>
      {/* derecha: él, con la voz de oro */}
      <div style={{position: 'absolute', left: split, top: 0, width: W - split, height: H, overflow: 'hidden', background: `radial-gradient(ellipse at 70% 50%, rgba(233,180,76,${0.25 + (f >= notF ? 0.25 : 0)}), #050505 70%)`}}>
        <div style={{position: 'absolute', left: -split, top: 0, width: W, height: H}}>
          <div style={{transform: 'scaleX(-1)', position: 'absolute', inset: 0, transformOrigin: '540px 50%'}}>
            <DetectiveHead x={300} y={1060} s={1.5} rim={N.goldHot} rimAmt={1} mouth="gold" open={f >= notF ? 0.8 : 0.2} />
          </div>
        </div>
      </div>
      {/* las letras de oro vuelan y chocan contra el humo */}
      {f >= notF && !hit ? (
        <div style={{position: 'absolute', left: 640 - fly * 420, top: 1000, fontFamily: font.serif, fontWeight: 700, fontSize: 120, whiteSpace: 'nowrap', ...goldVoice(f)}}>NOT TODAY</div>
      ) : null}
      {hit
        ? shards.map((s, k) => (
            <div key={k} style={{position: 'absolute', left: s.x + s.vx * lt, top: s.y + s.vy * lt + 1400 * lt * lt, width: s.s, height: s.s * 0.6, background: N.red, transform: `rotate(${s.rot + lt * 400}deg)`, opacity: Math.max(0, 1 - lt * 0.9)}} />
          ))
        : null}
      <AbsoluteFill style={{background: N.goldHot, opacity: interpolate(f - notF - 8, [0, 1, 6], [0, 0.55, 0], clamp)}} />
      <NoirTitle scene={scene} accent={(fr) => goldVoice(fr)} />
      <Rain t={t} opacity={0.3} />
      <Film f={f} />
      <div style={{opacity: 0}}>{dur}</div>
    </AbsoluteFill>
  );
};

// ---------------- 10) 2 palabras. $8,000 por año. (el neón pasa a oro, los billetes vuelven) ----------------
export const S10: React.FC<P> = ({scene, dur}) => {
  const {f, t} = useLocal();
  const gold = lerp(f, 4, 10, 0, 1, (x) => x);
  const back = lerp(f, 6, dur, 0, 1, outCubic);
  return (
    <AbsoluteFill style={{background: N.black}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #050505 0%, #1A1A1A 70%)'}} />
      <Skyline y={1450} t={t} />
      <Neon f={f} gold={gold} top={640} />
      {Array.from({length: 6}, (_, k) => {
        const p = Math.max(0, Math.min(1, back * 1.4 - k * 0.08));
        return <div key={k} style={{position: 'absolute', left: 820 - p * 480 + k * 10, top: 300 + p * 800 + Math.sin(p * 6 + k) * 30, width: 200, height: 90, borderRadius: 8, background: 'rgba(255,226,154,0.85)', border: '2px solid #8A6400', transform: `rotate(${(1 - p) * 60 + k * 7}deg)`}} />;
      })}
      <div style={{position: 'absolute', left: 250, top: 1160, width: 380, height: 220, borderRadius: 20, background: 'linear-gradient(135deg, #3A2E14, #141008)', border: '4px solid #8A6400'}} />
      <Rain t={t} n={160} speed={1.2} opacity={0.55} />
      <NoirTitle scene={scene} accent={(fr) => goldVoice(fr)} top={200} />
      <Film f={f} />
    </AbsoluteFill>
  );
};

// ---------------- 11) Escuchá esta noche... (vuelve el cuadro 0) ----------------
export const S11: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const fl = f + 1 - dur; // cuadro relativo al final: 0 en el último cuadro
  const headOut = lerp(f, dur - 12, dur - 3, 1, 0);
  const rainSpeed = 1 + 0.6 * lerp(f, 0, dur - 10, 1, 0, (x) => x);
  return (
    <AbsoluteFill>
      <Frame0 t={fl / fps} f={fl} rainSpeed={rainSpeed} />
      <NoirTitle scene={scene} opacity={headOut} />
      <div style={{opacity: 0}}>{outExpo(0)}</div>
    </AbsoluteFill>
  );
};

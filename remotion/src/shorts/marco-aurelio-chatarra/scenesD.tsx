// Escenas 9 y 10: la espiral estalla como vidrio y se arrancan las etiquetas; la cita grabada en mármol.
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {hash, rng, syncTokens} from '../../director';
import {goldStyle, Shockwave} from '../../kinetic';
import {color, font, H, W} from '../../theme';
import type {Scene} from '../../types';
import {drawAureus} from './Aureus';
import {clamp, lerp, OnScreen, useLocal, wordFrame} from './util';
import {Spiral} from './scenesC';

type P = {scene: Scene; dur: number};

// Triángulos de vidrio que cubren la pantalla (grilla con puntos corridos).
const useShards = () =>
  useMemo(() => {
    const r = rng(9);
    const cols = 3;
    const rows = 5;
    const pts: Array<Array<[number, number]>> = [];
    for (let j = 0; j <= rows; j++) {
      const row: Array<[number, number]> = [];
      for (let i = 0; i <= cols; i++) {
        const edgeX = i === 0 || i === cols;
        const edgeY = j === 0 || j === rows;
        row.push([(i / cols) * W + (edgeX ? 0 : (r() - 0.5) * 220), (j / rows) * H + (edgeY ? 0 : (r() - 0.5) * 260)]);
      }
      pts.push(row);
    }
    const tris: Array<{poly: Array<[number, number]>; cx: number; cy: number}> = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const a = pts[j][i];
        const b = pts[j][i + 1];
        const c = pts[j + 1][i + 1];
        const d = pts[j + 1][i];
        for (const poly of r() > 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]) {
          const cx = poly.reduce((s, p) => s + p[0], 0) / 3;
          const cy = poly.reduce((s, p) => s + p[1], 0) / 3;
          tris.push({poly: poly as Array<[number, number]>, cx, cy});
        }
      }
    return tris;
  }, []);

const Sticker: React.FC<{text: string; sub?: string; ripAt: number; power: number; dir: 1 | -1}> = ({text, sub, ripAt, power, dir}) => {
  const {f} = useLocal();
  const p = interpolate(f, [ripAt, ripAt + 9], [0, 1], {...clamp, easing: (x) => x * x});
  if (p >= 1) return null;
  return (
    <div style={{perspective: 900}}>
      <div
        style={{
          padding: '26px 48px',
          background: 'linear-gradient(140deg, #FFF3C8, #E0B04F 45%, #FFE9A3 55%, #A9822E)',
          borderRadius: 18,
          border: '4px solid #6B4E17',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(232,184,90,0.5)',
          textAlign: 'center',
          transform: `translate(${-dir * p * 1100 * power}px, ${-p * 700 * power}px) rotate(${-dir * p * 80 * power}deg) rotateY(${dir * p * 70}deg) skewX(${dir * p * -20}deg)`,
          transformOrigin: dir > 0 ? '100% 100%' : '0% 100%',
        }}
      >
        <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 70, letterSpacing: '0.12em', color: '#2A1E0C'}}>{text}</div>
        {sub ? <div style={{fontFamily: font.serif, fontWeight: 700, fontSize: 54, color: '#4A3410'}}>{sub}</div> : null}
      </div>
    </div>
  );
};

const Reveal: React.FC<{text: string; at: number}> = ({text, at}) => {
  const {f, fps} = useLocal();
  const s = spring({frame: f - at - 2, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  if (f < at) return null;
  return (
    <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 92, letterSpacing: '0.06em', color: '#E9EDF2', textShadow: '0 6px 0 #3E444B, 0 0 30px rgba(200,220,255,0.5)', transform: `scale(${interpolate(s, [0, 1], [2.6, 1])}) rotate(${(1 - s) * -10}deg)`, opacity: Math.min(1, s * 2), whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );
};

const BigWatch: React.FC<{raw: number}> = ({raw}) => (
  <svg width={430} height={430} viewBox="0 0 100 100" style={{filter: `grayscale(${raw}) brightness(${1 - raw * 0.25})`}}>
    <defs>
      <linearGradient id="bw" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF0B8" />
        <stop offset="0.5" stopColor="#E0B04F" />
        <stop offset="1" stopColor="#8A6420" />
      </linearGradient>
    </defs>
    <rect x={36} y={0} width={28} height={100} rx={8} fill="url(#bw)" stroke="#6B4E17" strokeWidth={2} />
    <circle cx={50} cy={50} r={32} fill="url(#bw)" stroke="#6B4E17" strokeWidth={2} />
    <circle cx={50} cy={50} r={25} fill="#141008" />
    {raw > 0.3
      ? Array.from({length: 5}, (_, i) => <circle key={i} cx={40 + (i % 3) * 10} cy={42 + Math.floor(i / 3) * 14} r={6} fill="none" stroke="#C9CED6" strokeWidth={2} strokeDasharray="2 1.2" />)
      : <path d="M50 50 L50 32 M50 50 L63 57" stroke="#E0B04F" strokeWidth={3} strokeLinecap="round" />}
  </svg>
);

const BigCar: React.FC<{raw: number}> = ({raw}) => (
  <svg width={700} height={350} viewBox="0 0 100 50" style={{filter: `grayscale(${raw}) brightness(${1 - raw * 0.3})`}}>
    <defs>
      <linearGradient id="bc" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE9A3" />
        <stop offset="1" stopColor="#9A7228" />
      </linearGradient>
    </defs>
    <path d="M4 36 L10 24 C14 18 22 15 32 15 L60 15 C70 15 76 20 82 26 L94 30 C97 31 98 34 98 37 L98 40 L4 40 Z" fill="url(#bc)" stroke="#5A4012" strokeWidth={1} />
    <path d="M26 24 L36 18 L58 18 L70 26 Z" fill="#9CC9E8" opacity={1 - raw} />
    <circle cx={24} cy={41} r={7} fill="#1A1A1A" stroke="#999" strokeWidth={1.5} />
    <circle cx={78} cy={41} r={7} fill="#1A1A1A" stroke="#999" strokeWidth={1.5} />
  </svg>
);

export const S9Labels: React.FC<P & {spiral: {rot: number; zoom: number; dropF: number}}> = ({scene, dur, spiral}) => {
  const {f, fps} = useLocal();
  const shards = useShards();
  const labelF = wordFrame(scene, fps, 'label', 1, 'start', 0.15);
  const watchF = wordFrame(scene, fps, 'watch', 1, 'start', 0.3);
  const metalF = wordFrame(scene, fps, 'metal', 1, 'start', 0.42);
  const carF = wordFrame(scene, fps, 'car', 1, 'start', 0.62);
  const steelF = wordFrame(scene, fps, 'steel', 1, 'start', 0.75);
  const shot = f < watchF ? 0 : f < carF ? 1 : 2;
  const cam = [1, 1.22, 0.9][shot];
  const ripHits = [labelF, metalF, steelF];
  const lastRip = [...ripHits].reverse().find((h) => f >= h) ?? -99;
  const kick = Math.max(0, 1 - (f - lastRip) / 8);
  const power = 1 + ripHits.indexOf(lastRip) * 0.4;
  const sx = Math.sin(f * 2.7) * kick * 26 * power;
  const sy = Math.cos(f * 3.3) * kick * 18 * power;
  const dropF = spiral.dropF;
  const toMarble = lerp(f, dur - 6, dur, 0, 1);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1C1812 0%, #050403 75%)'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${cam + kick * 0.05})`, transformOrigin: '50% 45%'}}>
        <div style={{position: 'absolute', top: 470, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
          {shot === 0 ? <Sticker text="PREMIUM" sub="Limited edition" ripAt={labelF} power={1} dir={1} /> : null}
          {shot === 1 ? (
            <>
              <div style={{position: 'relative'}}>
                <BigWatch raw={lerp(f, metalF, metalF + 8)} />
                <div style={{position: 'absolute', left: -60, top: 150}}>
                  <Sticker text="WATCH" sub="$5,000" ripAt={metalF} power={1.3} dir={-1} />
                </div>
              </div>
              <Reveal text="METAL + GEARS" at={metalF} />
            </>
          ) : null}
          {shot === 2 ? (
            <>
              <div style={{position: 'relative', marginTop: 80}}>
                <BigCar raw={lerp(f, steelF, steelF + 8)} />
                <div style={{position: 'absolute', left: 170, top: 60}}>
                  <Sticker text="CAR" sub="$60,000" ripAt={steelF} power={1.7} dir={1} />
                </div>
              </div>
              <Reveal text="STEEL + A LOAN" at={steelF} />
            </>
          ) : null}
        </div>
      </AbsoluteFill>
      {ripHits.map((h, i) => (
        <Shockwave key={i} at={h} x={W / 2} y={820} size={1000 + i * 300} />
      ))}
      <OnScreen scene={scene} top={250} size={118} />
      {/* la espiral congelada estalla como vidrio */}
      {f < dropF + 40
        ? shards.map((s, i) => {
            const d = Math.hypot(s.cx - W / 2, s.cy - H * 0.48) / 1100;
            const ft = Math.max(0, f - dropF - d * 6) / fps;
            const y = ft * ft * 2600 + ft * (s.cy - H * 0.48) * 0.8;
            const x = ft * (s.cx - W / 2) * 1.4;
            const rot = (hash(i) - 0.5) * 300 * ft;
            const poly = s.poly.map(([px, py]) => `${px}px ${py}px`).join(', ');
            return (
              <div key={i} style={{position: 'absolute', inset: 0, clipPath: `polygon(${poly})`, transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${1 - ft * 0.2})`, transformOrigin: `${s.cx}px ${s.cy}px`, filter: 'grayscale(0.7) contrast(1.3)'}}>
                <Spiral rot={spiral.rot} zoom={spiral.zoom} f={0} />
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.25), transparent 40%)', clipPath: `polygon(${poly})`}} />
              </div>
            );
          })
        : null}
      {/* la última etiqueta deja ver el mármol */}
      {toMarble > 0 ? <AbsoluteFill style={{background: '#0B0A09', opacity: toMarble}} /> : null}
    </AbsoluteFill>
  );
};

// ---------------- 10) La cita, grabada en mármol ----------------
const Veins: React.FC = () => {
  const paths = useMemo(() => {
    const r = rng(31);
    return Array.from({length: 16}, () => {
      let x = r() * W;
      let y = r() * -200;
      let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
      for (let k = 0; k < 9; k++) {
        const nx = x + (r() - 0.4) * 340;
        const ny = y + 160 + r() * 200;
        d += ` Q${(x + (r() - 0.5) * 200).toFixed(0)} ${((y + ny) / 2).toFixed(0)} ${nx.toFixed(0)} ${ny.toFixed(0)}`;
        x = nx;
        y = ny;
      }
      return {d, w: 0.6 + r() * 2.6, o: 0.15 + r() * 0.4};
    });
  }, []);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="marbleNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.009" numOctaves={4} seed={4} />
          <feColorMatrix values="0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0.9 0" />
        </filter>
        <filter id="veinGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={W} height={H} fill="#0C0B0A" />
      <rect width={W} height={H} filter="url(#marbleNoise)" />
      <g filter="url(#veinGlow)">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke="#D9B25E" strokeWidth={p.w} opacity={p.o} />
        ))}
      </g>
    </svg>
  );
};

// Busto de mármol de perfil: la misma cabeza laureada de su moneda, tallada en piedra y en grande.
const MarbleBust: React.FC<{x: number; y: number; scale: number; light: number}> = ({x, y, scale, light}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, 1024, 1024);
    drawAureus(g, 1024, 'marble');
  }, []);
  const size = 512 * scale;
  return (
    <canvas
      ref={ref}
      width={1024}
      height={1024}
      style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: 0.85 + light * 0.15, filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.8)) brightness(${0.85 + light * 0.4})`, transform: 'scaleX(-1)'}}
    />
  );
};

const Spark: React.FC<{f: number; seed: number}> = ({f, seed}) => (
  <>
    {Array.from({length: 12}, (_, k) => {
      const life = (f + k * 2) % 10;
      const ang = -Math.PI / 2 + (hash(k * 13 + seed + Math.floor((f + k * 2) / 10)) - 0.5) * Math.PI * 1.4;
      const dist = life * 11;
      return (
        <span key={k} style={{position: 'absolute', right: -4, top: '50%', width: 6, height: 6, borderRadius: '50%', background: '#FFF4C9', boxShadow: '0 0 10px 4px rgba(255,190,90,0.9)', transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist + life * life * 0.6}px)`, opacity: 1 - life / 10}} />
      );
    })}
  </>
);

// Letras que se graban al ritmo de la voz: aparecen al rojo blanco y se asientan en oro.
const Engrave: React.FC<{tokens: string[]; times: number[]; endTime: number; size: number; style?: React.CSSProperties}> = ({tokens, times, endTime, size, style}) => {
  const {f} = useLocal();
  return (
    <div style={{fontFamily: font.serif, fontWeight: 700, fontSize: size, lineHeight: 1.12, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', ...style}}>
      {tokens.map((tok, i) => {
        const a = times[i] ?? 0;
        const b = Math.max(a + 3, Math.min(times[i + 1] ?? endTime, a + 14));
        const p = Math.max(0, Math.min(1, (f - a) / (b - a)));
        const n = Math.ceil(p * tok.length);
        const hot = Math.max(0, 1 - (f - b) / 10);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', margin: '0 0.14em'}}>
            <span style={{visibility: 'hidden'}}>{tok}</span>
            <span style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', ...goldStyle(f, i, 5, 1.1 + hot)}}>{tok.slice(0, n)}</span>
            {p > 0 && hot > 0.6 ? <span style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', color: '#FFF8E6', opacity: hot * 0.7}}>{tok.slice(0, n)}</span> : null}
            {p > 0 && p < 1 ? (
              <span style={{position: 'absolute', left: 0, top: 0, width: `${p * 100}%`, height: '100%'}}>
                <Spark f={f} seed={i * 7} />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

export const S10Marble: React.FC<P> = ({scene, dur}) => {
  const {f, fps} = useLocal();
  const quote = typeof (scene as {quote?: unknown}).quote === 'string' ? ((scene as {quote?: string}).quote as string) : '';
  const tokens = quote.split(/\s+/).filter(Boolean);
  const qStart = Math.max(0, scene.words.findIndex((w) => w.text.toLowerCase().startsWith((tokens[0] ?? '').toLowerCase().slice(0, 4))));
  const qWords = scene.words.slice(qStart);
  const times = syncTokens(tokens, qWords, 2.5).map((x) => Math.round(x * fps));
  const endF = wordFrame(scene, fps, 'reason', 1, 'end', 0.95);
  // "Marcus wrote it down:" → se graba la obra mientras la voz lo dice (cero tiempo muerto)
  const introTokens = ['Meditations', '·', '6.13'];
  const introEnd = qWords.length ? Math.round(qWords[0].start * fps) : 30;
  const introTimes = [0, Math.round(introEnd * 0.45), Math.round(introEnd * 0.6)];
  const push = lerp(f, 0, dur, 0, 1, (x) => x);
  const bustIn = interpolate(f, [0, Math.round(dur * 0.5)], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
  const gong = Math.max(0, 1 - (f - endF) / 14) * (f >= endF ? 1 : 0);
  return (
    <AbsoluteFill style={{background: '#0B0A09'}}>
      {/* cámara que avanza sobre la piedra */}
      <AbsoluteFill style={{transform: `scale(${1.04 + push * 0.12}) rotate(${-1 + push * 2}deg)`}}>
        <Veins />
        <AbsoluteFill style={{background: `radial-gradient(ellipse at ${35 + push * 30}% 45%, rgba(255,220,150,${0.14 + gong * 0.25}) 0%, transparent 55%)`}} />
        <MarbleBust x={1300 - bustIn * 520} y={1180} scale={1.9} light={gong} />
      </AbsoluteFill>
      {/* placa oscura detrás del texto: contraste alto */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 38% at 50% 46%, rgba(4,3,2,0.88) 0%, rgba(4,3,2,0.65) 55%, transparent 100%)'}} />
      <div style={{position: 'absolute', top: 280, width: W, display: 'flex', justifyContent: 'center'}}>
        <Engrave tokens={introTokens} times={introTimes} endTime={introEnd} size={76} style={{letterSpacing: '0.18em'}} />
      </div>
      <div style={{position: 'absolute', top: 470, left: 70, width: W - 140, transform: `scale(${1 + gong * 0.04})`}}>
        <Engrave tokens={tokens} times={times} endTime={endF} size={106} />
      </div>
      <div style={{position: 'absolute', top: 1190, width: W, textAlign: 'center', opacity: lerp(f, endF - 2, endF + 8), transform: `translateY(${(1 - lerp(f, endF - 2, endF + 8)) * 20}px)`}}>
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 38, letterSpacing: '0.3em', color: '#FFE7A3', textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>MARCUS AURELIUS</div>
      </div>
      <Shockwave at={endF} x={W / 2} y={820} size={1600} />
      {/* del busto cae una pieza de reloj que rebota hacia la escena 11 */}
      {f > dur - 12 ? (
        <div style={{position: 'absolute', left: 150, top: interpolate(f, [dur - 12, dur], [1150, 1900], {...clamp, easing: (x) => x * x}), width: 60, height: 60, borderRadius: '50%', border: '8px dashed #E0B04F', transform: `rotate(${f * 20}deg)`}} />
      ) : null}
    </AbsoluteFill>
  );
};

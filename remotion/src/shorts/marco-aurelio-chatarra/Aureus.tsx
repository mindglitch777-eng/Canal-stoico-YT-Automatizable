// Áureo de Marco Aurelio: perfil laureado con barba, como en sus monedas.
// El perfil está dibujado a mano en coordenadas de 512x512 y sirve para la moneda 3D y para el mármol.
import React, {useMemo} from 'react';
import * as THREE from 'three';

// Silueta de la cabeza (mira a la derecha).
export const HEAD =
  'M170 402 C182 362 192 322 188 284 C180 250 170 214 176 178 C184 140 214 112 256 104 C300 98 336 116 352 150 ' +
  'C360 168 360 184 360 196 C368 212 374 228 382 244 C384 250 378 254 370 256 C372 262 368 268 362 270 ' +
  'C366 276 364 282 358 284 C364 294 364 306 356 318 C348 334 338 344 330 352 C328 372 330 392 334 410 Z';

// Rulos de barba y pelo, hojas de laurel y cintas.
const beardCurls: Array<[number, number, number]> = [
  [342, 300, 11], [330, 318, 12], [316, 332, 12], [300, 342, 12], [284, 348, 11], [326, 296, 10], [312, 312, 11], [296, 326, 11],
  [280, 334, 10], [268, 322, 10], [338, 282, 9], [352, 312, 9],
];
const hairCurls: Array<[number, number, number]> = [
  [220, 150, 13], [246, 136, 13], [274, 132, 12], [300, 140, 12], [204, 178, 13], [228, 176, 12], [196, 208, 12], [212, 236, 12],
  [200, 262, 12], [222, 270, 11], [254, 162, 11], [282, 158, 10],
];
const laurel: Array<[number, number, number]> = Array.from({length: 13}, (_, i) => {
  const a = Math.PI * (1.05 + i * 0.075);
  return [262 + Math.cos(a) * 112, 222 + Math.sin(a) * 112, (a * 180) / Math.PI + 90] as [number, number, number];
});

export const drawAureus = (g: CanvasRenderingContext2D, size = 1024, material: 'gold' | 'marble' = 'gold') => {
  const k = size / 512;
  const marble = material === 'marble';
  g.save();
  g.scale(k, k);
  if (!marble) {
  // campo de oro con relieve
  const grad = g.createRadialGradient(190, 170, 30, 256, 256, 262);
  grad.addColorStop(0, '#FFE9A8');
  grad.addColorStop(0.5, '#D9A845');
  grad.addColorStop(1, '#7A5214');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  // borde de puntos
  g.fillStyle = 'rgba(80,50,10,0.55)';
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    g.beginPath();
    g.arc(256 + Math.cos(a) * 236, 256 + Math.sin(a) * 236, 3.2, 0, Math.PI * 2);
    g.fill();
  }
  // leyenda
  g.font = '700 34px "Cormorant Garamond", Georgia, serif';
  g.fillStyle = 'rgba(70,42,8,0.85)';
  const legend = 'IMP · M · ANTONINVS · AVG';
  const startA = Math.PI * 0.82;
  const span = Math.PI * 1.36;
  for (let i = 0; i < legend.length; i++) {
    const a = startA + (i / (legend.length - 1)) * span;
    g.save();
    g.translate(256 + Math.cos(a) * 204, 256 + Math.sin(a) * 204);
    g.rotate(a + Math.PI / 2);
    g.textAlign = 'center';
    g.fillText(legend[i], 0, 0);
    g.restore();
  }
  }
  // relieve: sombra abajo-derecha, luz arriba-izquierda
  const head = new Path2D(HEAD);
  g.save();
  g.translate(4, 5);
  g.fillStyle = 'rgba(60,35,5,0.6)';
  g.fill(head);
  g.restore();
  const hg = g.createLinearGradient(170, 110, 380, 410);
  hg.addColorStop(0, marble ? '#FFFFFF' : '#FFF0C0');
  hg.addColorStop(0.55, marble ? '#D6D0C4' : '#E2B457');
  hg.addColorStop(1, marble ? '#8A8378' : '#A87526');
  g.fillStyle = hg;
  g.fill(head);
  g.strokeStyle = 'rgba(90,55,10,0.7)';
  g.lineWidth = 2.5;
  g.stroke(head);
  const curl = (x: number, y: number, r: number) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,236,170,0.55)';
    g.fill();
    g.beginPath();
    g.arc(x + 1.5, y + 2, r * 0.7, 0.3, Math.PI * 1.6);
    g.strokeStyle = 'rgba(100,62,12,0.7)';
    g.lineWidth = 2;
    g.stroke();
  };
  beardCurls.forEach(([x, y, r]) => curl(x, y, r));
  hairCurls.forEach(([x, y, r]) => curl(x, y, r));
  // laurel
  laurel.forEach(([x, y, rot]) => {
    g.save();
    g.translate(x, y);
    g.rotate((rot * Math.PI) / 180);
    g.beginPath();
    g.ellipse(-9, 0, 14, 5.5, -0.5, 0, Math.PI * 2);
    g.ellipse(9, 0, 14, 5.5, 0.5, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,240,190,0.75)';
    g.fill();
    g.strokeStyle = 'rgba(100,62,12,0.8)';
    g.lineWidth = 1.6;
    g.stroke();
    g.restore();
  });
  // cintas del laurel
  g.strokeStyle = 'rgba(110,70,15,0.85)';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(168, 236);
  g.bezierCurveTo(140, 262, 150, 292, 128, 318);
  g.moveTo(172, 246);
  g.bezierCurveTo(156, 280, 172, 304, 156, 336);
  g.stroke();
  // ojo, oreja, ceja
  g.strokeStyle = 'rgba(90,55,10,0.9)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(330, 214);
  g.quadraticCurveTo(342, 208, 352, 214);
  g.moveTo(326, 200);
  g.quadraticCurveTo(342, 190, 356, 198);
  g.stroke();
  g.beginPath();
  g.ellipse(262, 226, 14, 22, 0.2, -1.2, 2.2);
  g.stroke();
  g.restore();
};

export const aureusTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  drawAureus(c.getContext('2d')!, 1024);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// Moneda 3D (va dentro de un ThreeCanvas). Mira a la cámara (+Z).
export const AureusMesh: React.FC<{position?: [number, number, number]; rotation?: [number, number, number]; scale?: number}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({map: aureusTexture(), metalness: 0.85, roughness: 0.3}), []);
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#D9A845', metalness: 1, roughness: 0.25}), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={edgeMat}>
          <cylinderGeometry args={[2, 2, 0.24, 96, 1, true]} />
        </mesh>
        <mesh material={faceMat} position={[0, 0.121, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2, 96]} />
        </mesh>
        <mesh material={faceMat} position={[0, -0.121, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
          <circleGeometry args={[2, 96]} />
        </mesh>
      </group>
    </group>
  );
};

// Versión 2D (para el mármol y escenas sin 3D).
export const AureusCanvas: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, size, size);
    g.save();
    g.beginPath();
    g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    g.clip();
    drawAureus(g, size);
    g.restore();
  }, [size]);
  return <canvas ref={ref} width={size} height={size} style={{borderRadius: '50%', ...style}} />;
};

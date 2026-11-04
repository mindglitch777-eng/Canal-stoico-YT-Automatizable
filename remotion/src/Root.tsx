import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {demoTimeline} from './demo';
import {Short} from './Short';
import {FPS, H, W} from './theme';
import type {Timeline} from './types';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={300}
    defaultProps={demoTimeline as Timeline}
    calculateMetadata={({props}) => ({
      // Duración = la línea de tiempo + medio segundo de cola.
      durationInFrames: Math.ceil((props.total + 0.5) * FPS),
    })}
  />
);

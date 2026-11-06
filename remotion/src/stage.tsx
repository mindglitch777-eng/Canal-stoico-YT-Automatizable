import React from 'react';
import {stage, safe, W} from './theme';

// Zona de contenido: centrado vertical y horizontal dentro del área segura.
export const Stage: React.FC<{children: React.ReactNode; top?: number; bottom?: number; align?: 'center' | 'left'; style?: React.CSSProperties}> = ({
  children,
  top = stage.top,
  bottom = stage.bottom,
  align = 'center',
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: safe.side,
      width: W - safe.side * 2,
      height: bottom - top,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align,
      transformStyle: 'preserve-3d',
      ...style,
    }}
  >
    {children}
  </div>
);

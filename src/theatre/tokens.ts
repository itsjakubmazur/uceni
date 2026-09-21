import type { CSSProperties } from 'react';

/** Tokeny světa. Zdroj pravdy je DESIGN.md, tohle je jeho zápis do kódu. */
export const THEATRE_TOKENS = {
  '--paper': '#F3E5CA',
  '--paper-deep': '#E2CCA4',
  '--paper-edge': '#C3A377',
  '--ink': '#241C16',
  '--ink-soft': '#3B2A20',
  '--madder': '#B0392B',
  '--madder-deep': '#8E2C21',
  '--madder-dark': '#631A14',
  '--ochre': '#D69C36',
  '--teal': '#2F6B62',
  '--teal-deep': '#24564F',
  '--lamp': '#F7C86B',
  '--lamp-bright': '#FBDC9A',
  '--wood': '#7A5C3B',
  '--wood-deep': '#5C4429',

  '--glass-tint': 'rgba(243, 229, 202, 0.10)',
  '--glass-edge':
    'linear-gradient(155deg, rgba(255,252,242,.9), rgba(255,252,242,.1) 45%, rgba(59,42,32,.45))',
  '--glass-sheen': 'linear-gradient(to bottom, rgba(255,252,243,.3), rgba(255,252,243,0))',
  '--glass-shadow': '0 14px 30px -14px rgba(59,42,32,.6)',
  '--glass-blur': '5px',
  '--glass-saturate': '1.25',
} as CSSProperties;
